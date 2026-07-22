// ─────────────────────────────────────────────
//  daily.js  —  N daily
//  Claim daily rewards once per day (resets 12 AM IST).
//  Base: 1000 Ryo · 1 Ramen · 30 Chakra Essence · 1 EXP Scroll
//  Passives: Konohamaru (Ryo) · Teuchi (Ramen) · Tsunade (jackpot)
//
//  Design: premium embed showing base rewards + passive bonuses
//  separately, with an ℹ️ info button listing passive cards.
// ─────────────────────────────────────────────

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { q }            = require('../database');
const { COLORS, DAILY_REWARDS, COMBAT_EMOJIS } = require('../config');
const { checkRegistered }       = require('../utils/guards');
const { resolvePassiveBonuses } = require('../utils/passives');
const { errorEmbed }            = require('../utils/embeds');
const { formatCountdown } = require('../utils/timeUtils');

const JACKPOT_RYO    = 10_000;
const JACKPOT_CHANCE = 0.01; // 1%

// ── Passive card guide info ───────────────────
const DAILY_PASSIVE_GUIDE = [
  {
    id: 'konohamaru',
    name: 'Konohamaru',
    desc: 'M1 +500 Ryo  ·  M2 +1,000 Ryo  ·  M3 +3,000 Ryo',
  },
  {
    id: 'teuchi',
    name: 'Teuchi',
    desc: 'M1 +1 Ramen  ·  M2 +2 Ramen  ·  M3 +4 Ramen',
  },
  {
    id: 'tsunade',
    name: 'Tsunade',
    desc: '1% chance to win +10,000 Ryo (jackpot)',
  },
];

module.exports = {
  name: 'daily',
  description: 'Claim your daily rewards · N daily',

  async execute(message) {
    const userId = message.author.id;
    let user = checkRegistered(message);
    if (!user) return;

    const now        = Date.now();
    const COOLDOWN   = 24 * 60 * 60 * 1000; // 24 hours
    const lastClaim  = user.daily_reset_at;
    const elapsed    = now - lastClaim;

    // ── Cooldown check ─────────────────────────
    if (lastClaim > 0 && elapsed < COOLDOWN) {
      const remaining = COOLDOWN - elapsed;
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.default)
          .setTitle('🎁 Daily Rewards')
          .setDescription(
            `You already collected your daily rewards.\n\n` +
            `⏳ Try again in **${formatCountdown(remaining)}**`
          )
          .setFooter({ text: 'Resets 24 hours after your last claim' })],
      });
    }

    // ── Passive bonuses ────────────────────────
    const pb = resolvePassiveBonuses(userId);

    // ── Calculate rewards ──────────────────────
    let ryo          = DAILY_REWARDS.ryo    + pb.dailyRyo;
    let ramen        = DAILY_REWARDS.ramen  + pb.dailyRamen;
    const essence    = DAILY_REWARDS.chakraEssence;
    const expScrolls = DAILY_REWARDS.expScrolls;

    let jackpotWon = false;
    if (pb.tsunadeJackpot && Math.random() < JACKPOT_CHANCE) {
      ryo       += JACKPOT_RYO;
      jackpotWon = true;
    }

    // ── Apply rewards ──────────────────────────
    q.addRyo.run(ryo, userId);
    q.addRamen.run(ramen, userId);
    q.addChakraEssence.run(essence, userId);
    q.addExpScrolls.run(expScrolls, userId);
    q.setDailyReset.run(now, userId);

    const freshUser  = q.getUser.get(userId);
    const nextClaim  = now + COOLDOWN;
    const divider      = '━━━━━━━━━━━━━━━━━━';

    // ── Base rewards section ───────────────────
    const baseLines = [
      `${divider}`,
      `**Base Rewards**`,
      ``,
      `${COMBAT_EMOJIS.ryo} +${DAILY_REWARDS.ryo.toLocaleString()} Ryo`,
      `🍜 +${DAILY_REWARDS.ramen} Ramen`,
      `${COMBAT_EMOJIS.essence} +${essence} Chakra Essence`,
    ];

    // ── Passive bonuses section ────────────────
    const hasPassives = pb.dailyRyo > 0 || pb.dailyRamen > 0 || pb.tsunadeJackpot;
    const passiveLines = [];

    if (hasPassives) {
      passiveLines.push(``, `${divider}`, `**Passive Bonuses**`, ``);

      if (pb.dailyRyo > 0) {
        passiveLines.push(`Konohamaru — ${COMBAT_EMOJIS.ryo} +${pb.dailyRyo.toLocaleString()} Ryo`);
      }
      if (pb.dailyRamen > 0) {
        passiveLines.push(`Teuchi — 🍜 +${pb.dailyRamen} Ramen`);
      }
      if (jackpotWon) {
        passiveLines.push(`Tsunade — ${COMBAT_EMOJIS.ryo} **✨ JACKPOT! +${JACKPOT_RYO.toLocaleString()} Ryo**`);
      } else if (pb.tsunadeJackpot) {
        passiveLines.push(`Tsunade — 1% jackpot *(not this time)*`);
      }
    }

    passiveLines.push(``, `${divider}`);

    const embed = new EmbedBuilder()
      .setColor(jackpotWon ? COLORS.prestige : 0x7C3AED)
      .setTitle(jackpotWon ? '✨ JACKPOT! — Daily Rewards' : '🎁 Daily Rewards')
      .setDescription([...baseLines, ...passiveLines].join('\n'))
      .addFields(
        {
          name:   `${COMBAT_EMOJIS.ryo} Ryo`,
          value:  `**${freshUser.ryo.toLocaleString()}**`,
          inline: true,
        },
        {
          name:   '🍜 Ramen',
          value:  `**${freshUser.ramen}**`,
          inline: true,
        },
        {
          name:   `${COMBAT_EMOJIS.essence} Essence`,
          value:  `**${freshUser.chakra_essence.toLocaleString()}**`,
          inline: true,
        },
      )
      .setFooter({ text: `Claim Again · ${formatCountdown(nextClaim - now)}` });

    // ── Info button ────────────────────────────
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('daily_info')
        .setLabel('ℹ  Passive Cards')
        .setStyle(ButtonStyle.Secondary),
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    // ── Info button collector ──────────────────
    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId && i.customId === 'daily_info',
      time:   120_000,
      max:    5,
    });

    collector.on('collect', async i => {
      const ownedIds = new Set(
        q.getUserCards.all(userId).map(c => c.character_id)
      );

      const lines = DAILY_PASSIVE_GUIDE.map(p => {
        const status = ownedIds.has(p.id) ? '✅' : '❌';
        return `${status} **${p.name}**\n> ${p.desc}`;
      });

      const infoEmbed = new EmbedBuilder()
        .setColor(0x7C3AED)
        .setTitle('📋 Daily Passive Cards')
        .setDescription(
          `Own these cards to boost your daily rewards.\n\n` +
          lines.join('\n\n')
        )
        .setFooter({ text: 'Passives activate at any mastery level' });

      await i.reply({ embeds: [infoEmbed], ephemeral: true });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
