// ─────────────────────────────────────────────
//  all.js  —  N all
//  Browse every character in the game roster,
//  highest rarity first (S → A → B → C).
//  No account required.
// ─────────────────────────────────────────────

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CHARACTERS }       = require('../data/characters');
const { RARITIES }         = require('../config');
const { buildRosterEmbed } = require('../utils/embeds');

// ── Sort: S → A → B → C → D → SS → UR ────────
const RARITY_ORDER = { UR: 0, SS: 1, S: 2, A: 3, B: 4, C: 5, D: 6 };

const ALL_CHARS = Object.values(CHARACTERS).sort((a, b) => {
  const ra = RARITY_ORDER[a.rarity] ?? 99;
  const rb = RARITY_ORDER[b.rarity] ?? 99;
  return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
});

function buildPage(idx) {
  const char  = ALL_CHARS[idx];
  const total = ALL_CHARS.length;
  const label = RARITIES[char.rarity]?.label ?? char.rarity;
  return buildRosterEmbed(char, `Character ${idx + 1} of ${total}  ·  ${label}  ·  ${char.name}`);
}

function buildNavRow(page, total) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('all_prev')
      .setLabel('◀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('all_next')
      .setLabel('▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= total - 1),
  );
}

module.exports = {
  name: 'all',
  description: 'Browse every character in the roster (highest rarity first).',

  async execute(message) {
    let page = 0;
    const total = ALL_CHARS.length;

    const reply = await message.reply({
      embeds:     [buildPage(0)],
      components: [buildNavRow(0, total)],
    });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time:   300_000,
    });

    collector.on('collect', async i => {
      if (i.customId === 'all_prev') page = Math.max(0, page - 1);
      else                           page = Math.min(total - 1, page + 1);

      await i.update({
        embeds:     [buildPage(page)],
        components: [buildNavRow(page, total)],
      });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
