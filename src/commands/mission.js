// ─────────────────────────────────────────────
//  mission.js  —  N mission
//  Shinobi Mission system — Naruto trivia with
//  four-button answers, cooldown, and rewards.
// ─────────────────────────────────────────────

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { q, trialTicketStatements } = require('../database');
const { COLORS, COMBAT_EMOJIS, ARROW_EMOJI, E } = require('../config');
const { checkRegistered } = require('../utils/guards');
const { errorEmbed }      = require('../utils/embeds');
const { formatCountdown } = require('../utils/timeUtils');
const { MISSIONS }        = require('../data/missions');

// ── Constants ─────────────────────────────────
const COOLDOWN_MS    = 3 * 60 * 1000; // 3 minutes
const TIME_LIMIT_MS  = 30_000;        // 30 seconds
const SCROLL_CHANCE  = 0.30;          // 30% chance per correct answer

const RANK_CONFIG = {
  D: { title: 'Village Errand',       color: 0x99AAB5, ryo: 1_000 },
  C: { title: 'Standard Assignment',  color: 0x47C74B, ryo: 2_000 },
  B: { title: 'Dangerous Operation',  color: 0x3FA9FF, ryo: 3_500 },
  A: { title: 'High Priority Mission', color: 0xA85FFF, ryo: 5_000 },
};

// Rank picked randomly — equal 25% each
const RANKS = ['D', 'C', 'B', 'A'];

// ── Helpers ───────────────────────────────────

/** Fisher-Yates shuffle — returns a new array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a random element from an array */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Format remaining cooldown time */
function cooldownMsg(expiresAt) {
  const remaining = expiresAt - Date.now();
  return remaining > 0 ? formatCountdown(remaining) : '0s';
}

// ── Button builders ───────────────────────────

function buildAnswerButtons(shuffledAnswers, disabled = false, highlightCorrect = -1, highlightWrong = -1) {
  const labels = ['A', 'B', 'C', 'D'];
  const buttons = shuffledAnswers.map((answer, idx) => {
    let style = ButtonStyle.Primary;
    if (disabled) {
      if (idx === highlightCorrect) style = ButtonStyle.Success;
      else if (idx === highlightWrong) style = ButtonStyle.Danger;
      else style = ButtonStyle.Secondary;
    }
    return new ButtonBuilder()
      .setCustomId(`msn_${idx}`)
      .setLabel(`${labels[idx]}. ${answer}`)
      .setStyle(style)
      .setDisabled(disabled);
  });
  return new ActionRowBuilder().addComponents(buttons);
}

// ── Mission embed builders ────────────────────

function buildMissionEmbed(rank, scenario, question, cfg) {
  return new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(
      `**Mission**\n${scenario}\n\n` +
      `**Question**\n${question}\n\n` +
      `Choose the correct answer below.`
    )
    .setFooter({ text: 'Answer within 30 seconds.' });
}

// Ticket roll table: Academy 30% · Chunin 27% · Jonin 23% · ANBU 20%
const TICKET_ROLLS = [
  { col: 'academy_trial_tickets', threshold: 30,  label: 'Academy Trial Ticket' },
  { col: 'chunin_trial_tickets',  threshold: 57,  label: 'Chunin Trial Ticket'  },
  { col: 'jonin_trial_tickets',   threshold: 80,  label: 'Jonin Trial Ticket'   },
  { col: 'anbu_trial_tickets',    threshold: 100, label: 'ANBU Trial Ticket'    },
];

function rollTicketType() {
  const r = Math.random() * 100;
  for (const entry of TICKET_ROLLS) {
    if (r < entry.threshold) return entry;
  }
  return TICKET_ROLLS[TICKET_ROLLS.length - 1];
}

function buildSuccessEmbed(rank, ryo, gotScroll, gotTicket, cfg) {
  const lines = [
    `Correct Answer!`,
    `You completed the mission successfully.`,
    ``,
    `**You received the following rewards:**`,
    `${ARROW_EMOJI} Ryo: **+${ryo.toLocaleString()}** ${COMBAT_EMOJIS.ryo}`,
  ];
  if (gotScroll) {
    lines.push(`${ARROW_EMOJI} Mission Scroll: **+1** ${E.scroll}`);
  }
  if (gotTicket) {
    lines.push(`${ARROW_EMOJI} 🎫 **${gotTicket.label}: +1**`);
  }
  return new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(lines.join('\n'));
}

function buildFailEmbed(rank, correctAnswer, cfg) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle(cfg.title)
    .setDescription(
      `Wrong Answer!\n` +
      `The mission has failed.\n\n` +
      `**Correct Answer**\n${correctAnswer}`
    )
    .setFooter({ text: 'Better luck next time.' });
}

function buildTimeoutEmbed(rank, correctAnswer, cfg) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle('Mission Failed')
    .setDescription(
      `Time has expired.\n\n` +
      `**Correct Answer**\n${correctAnswer}`
    )
    .setFooter({ text: 'Better luck next time.' });
}

// ── Command ───────────────────────────────────

module.exports = {
  name: 'mission',
  description: 'Complete a shinobi mission by answering Naruto trivia · N mission',

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    const now = Date.now();

    // ── Cooldown check ──────────────────────────
    const cooldownAt = user.mission_cooldown_at ?? 0;
    if (cooldownAt > now) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle('Still on Mission Recovery')
          .setDescription(
            `You are still recovering from your last mission.\n\n` +
            `Come back in **${cooldownMsg(cooldownAt)}**`
          )],
      });
    }

    // ── Pick rank and question ──────────────────
    const rank      = pick(RANKS);
    const pool      = MISSIONS[rank];
    const entry     = pick(pool);
    const cfg       = RANK_CONFIG[rank];

    // Shuffle answers and track where correct ended up
    const indexed   = entry.answers.map((a, i) => ({ text: a, isCorrect: i === entry.correct }));
    const shuffled  = shuffle(indexed);
    const correctShuffledIdx = shuffled.findIndex(x => x.isCorrect);
    const shuffledTexts      = shuffled.map(x => x.text);
    const correctAnswerText  = shuffled[correctShuffledIdx].text;

    // ── Build and send mission embed ────────────
    const embed  = buildMissionEmbed(rank, entry.scenario, entry.question, cfg);
    const row    = buildAnswerButtons(shuffledTexts);

    const reply  = await message.reply({ embeds: [embed], components: [row] });

    // ── Collector ───────────────────────────────
    let resolved = false;

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time:   TIME_LIMIT_MS,
      max:    1,
    });

    collector.on('collect', async interaction => {
      if (resolved) return;
      resolved = true;

      const pressedIdx = parseInt(interaction.customId.replace('msn_', ''), 10);
      const isCorrect  = pressedIdx === correctShuffledIdx;

      // Set cooldown immediately
      const expiresAt = Date.now() + COOLDOWN_MS;
      q.setMissionCooldown.run(expiresAt, userId);

      if (isCorrect) {
        // ── Correct ──────────────────────────────
        q.addRyo.run(cfg.ryo, userId);
        q.addMissionsFinished.run(userId);

        const gotScroll = Math.random() < SCROLL_CHANCE;
        if (gotScroll) q.addMissionScrolls.run(userId);

        // 1% chance to earn a random Trial Ticket
        let gotTicket = null;
        if (Math.random() < 0.01) {
          gotTicket = rollTicketType();
          trialTicketStatements[gotTicket.col].add.run(1, userId);
        }

        const disabledRow = buildAnswerButtons(shuffledTexts, true, correctShuffledIdx, -1);
        await interaction.update({
          embeds:     [buildSuccessEmbed(rank, cfg.ryo, gotScroll, gotTicket, cfg)],
          components: [disabledRow],
        });
      } else {
        // ── Wrong ────────────────────────────────
        const disabledRow = buildAnswerButtons(shuffledTexts, true, correctShuffledIdx, pressedIdx);
        await interaction.update({
          embeds:     [buildFailEmbed(rank, correctAnswerText, cfg)],
          components: [disabledRow],
        });
      }
    });

    collector.on('end', async (_, reason) => {
      if (resolved) return;
      resolved = true;

      // ── Timeout ──────────────────────────────
      const expiresAt = Date.now() + COOLDOWN_MS;
      q.setMissionCooldown.run(expiresAt, userId);

      const disabledRow = buildAnswerButtons(shuffledTexts, true, correctShuffledIdx, -1);
      try {
        await reply.edit({
          embeds:     [buildTimeoutEmbed(rank, correctAnswerText, cfg)],
          components: [disabledRow],
        });
      } catch { /* message may have been deleted */ }
    });
  },
};
