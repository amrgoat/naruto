// ─────────────────────────────────────────────
//  expedition.js  —  t expedition [area]
//
//  t expedition           → claim rewards (or see time remaining)
//  t expedition <area>    → start an expedition
//  Areas can be typed as full name or first-letter abbreviation
//  e.g. "training grounds" → "tg", "forest of death" → "fod"
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const {
  COLORS, E, COMBAT_EMOJIS, EXPEDITION_AREAS,
} = require('../config');
const { checkRegistered }         = require('../utils/guards');
const { formatCountdown }         = require('../utils/timeUtils');
const { scrollStatements }        = require('../database');

// ── Build area abbreviation map ────────────────
// e.g. "training_grounds" → "tg", "forest_of_death" → "fod"
const AREA_ABBR = {};
for (const area of Object.values(EXPEDITION_AREAS)) {
  const words = area.name.toLowerCase().split(/\s+/);
  const abbr  = words.map(w => w[0]).join('');
  AREA_ABBR[abbr] = area.key;
}

// ── Resolve area from user input ──────────────
function resolveArea(input) {
  const q_ = input.toLowerCase().trim();

  // Direct key match
  if (EXPEDITION_AREAS[q_.replace(/\s+/g, '_')]) {
    return EXPEDITION_AREAS[q_.replace(/\s+/g, '_')];
  }

  // Full name match (spaces)
  const byName = Object.values(EXPEDITION_AREAS).find(
    a => a.name.toLowerCase() === q_
  );
  if (byName) return byName;

  // Abbreviation match (e.g. "tg" → Training Grounds)
  const noSpace = q_.replace(/\s+/g, '');
  if (AREA_ABBR[noSpace]) return EXPEDITION_AREAS[AREA_ABBR[noSpace]];

  // Partial name match
  const partial = Object.values(EXPEDITION_AREAS).find(
    a => a.name.toLowerCase().includes(q_)
  );
  if (partial) return partial;

  return null;
}

// ── Apply expedition rewards to user ──────────
function applyRewards(userId, rewards) {
  if (rewards.ryo)            q.addRyo.run(rewards.ryo, userId);
  if (rewards.chakra_essence) q.addChakraEssence.run(rewards.chakra_essence, userId);
  if (rewards.exp_scrolls)    q.addExpScrolls.run(rewards.exp_scrolls, userId);
  // Scroll types
  for (const col of ['academy_scrolls', 'chunin_scrolls', 'jonin_scrolls', 'anbu_scrolls', 'hokage_scrolls']) {
    if (rewards[col]) scrollStatements[col].add.run(rewards[col], userId);
  }
}

// ── Format rewards summary ────────────────────
function rewardSummary(rewards) {
  const parts = [];
  if (rewards.ryo)            parts.push(`${E.ryo} **+${rewards.ryo.toLocaleString()}** Ryo`);
  if (rewards.chakra_essence) parts.push(`${COMBAT_EMOJIS.essence} **+${rewards.chakra_essence}** Chakra Essence`);
  if (rewards.exp_scrolls)    parts.push(`${E.scroll} **+${rewards.exp_scrolls}** EXP Scroll${rewards.exp_scrolls !== 1 ? 's' : ''}`);
  return parts.join('\n') || 'Nothing';
}

// ── Area list for the help embed ──────────────
function buildAreaList(userLevel) {
  return Object.values(EXPEDITION_AREAS).map(area => {
    const locked = userLevel < area.levelReq;
    const status = locked ? `🔒 Lv.${area.levelReq}` : '✅';
    const dur    = formatCountdown(area.duration);
    return `${status} **${area.name}** — ${dur}`;
  }).join('\n');
}

module.exports = {
  name: 'expedition',
  aliases: ['exp'],
  description: 'Send your team on an expedition · t expedition [area]',

  async execute(message, args) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    const userLevel = user.user_level ?? 1;

    // ── t expedition (no args) → claim or status ─
    if (!args.length) {
      const active = q.getExpedition.get(userId);

      if (!active) {
        return message.channel.send(
          `No one is on expedition. Use \`t expedition <area>\` to send your team out.`
        );
      }

      const now = Date.now();

      // Not done yet — show time remaining
      if (now < active.ends_at) {
        const area      = EXPEDITION_AREAS[active.area_key];
        const remaining = active.ends_at - now;
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(COLORS.EMBED_COLOR)
            .setTitle(`${E.team} Expedition in Progress`)
            .setDescription(
              `**${area?.name ?? active.area_key}**\n\n` +
              `Your team returns in **${formatCountdown(remaining)}**.`
            )],
        });
      }

      // Done — claim rewards
      const area = EXPEDITION_AREAS[active.area_key];
      if (!area) {
        q.clearExpedition.run(userId);
        return message.reply('Expedition complete! (Unknown area — rewards skipped.)');
      }

      applyRewards(userId, area.rewards);
      q.clearExpedition.run(userId);

      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.success)
          .setTitle(`${E.team} Expedition Complete!`)
          .setDescription(
            `Your team has returned from **${area.name}**!\n\n` +
            `**Rewards:**\n${rewardSummary(area.rewards)}`
          )],
      });
    }

    // ── t expedition <area> → start ────────────
    const areaInput = args.join(' ');
    const area      = resolveArea(areaInput);

    if (!area) {
      const list = Object.values(EXPEDITION_AREAS)
        .map(a => {
          const words = a.name.toLowerCase().split(/\s+/);
          const abbr  = words.map(w => w[0]).join('');
          return `**${a.name}** (\`${abbr}\`)`;
        })
        .join(', ');
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(`Unknown area **"${areaInput}"**.\nAvailable: ${list}`)],
      });
    }

    // ── Level requirement ──────────────────────
    if (userLevel < area.levelReq) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(
            `🔒 **${area.name}** requires **Level ${area.levelReq}**.\n` +
            `You are **Level ${userLevel}**. Pull more cards to gain XP!`
          )],
      });
    }

    // ── Check team ─────────────────────────────
    const team = q.getTeam.all(userId);
    if (!team.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(`You need a team set before going on expedition.\nUse \`t team add <card>\` to build your team.`)],
      });
    }

    // ── Check not already on expedition ────────
    const existing = q.getExpedition.get(userId);
    if (existing && Date.now() < existing.ends_at) {
      const old = EXPEDITION_AREAS[existing.area_key];
      const rem = existing.ends_at - Date.now();
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.warning)
          .setDescription(
            `Your team is already on **${old?.name ?? existing.area_key}**.\n` +
            `They return in **${formatCountdown(rem)}**.\n` +
            `Use \`t expedition\` to claim when done.`
          )],
      });
    }

    // ── Start expedition ───────────────────────
    const now     = Date.now();
    const endsAt  = now + area.duration;
    q.startExpedition.run(
      userId, area.key, now, endsAt,
      area.key, now, endsAt,
    );

    const dur = formatCountdown(area.duration);
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setTitle(`${E.team} Expedition Started!`)
        .setDescription(
          `Your team has set out for **${area.name}**!\n\n` +
          `⏱️ Returns in **${dur}**.\n` +
          `Use \`t expedition\` to claim your rewards when done.`
        )
        .addFields({
          name: 'Expected Rewards',
          value: rewardSummary(area.rewards),
          inline: false,
        })],
    });
  },
};
