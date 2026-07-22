// ─────────────────────────────────────────────
//  finv.js  —  N finv
//  Fragment Inventory: shows all character fragments
//  you've accumulated, 12 per page. Max 500 per char.
// ─────────────────────────────────────────────

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }              = require('../database');
const { CHARACTERS }     = require('../data/characters');
const { COLORS, RARITIES, E } = require('../config');
const { checkRegistered } = require('../utils/guards');

const PAGE_SIZE   = 12;
const MAX_FRAGS   = 500;

const RARITY_ORDER = { D: 0, C: 1, B: 2, A: 3, S: 4, SS: 5, UR: 6 };

function buildPage(entries, page, username) {
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const slice      = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const lines = slice.map(({ character_id, count }) => {
    const char   = CHARACTERS[character_id];
    if (!char) return null;
    const rarity = RARITIES[char.rarity] ?? RARITIES.D;
    const maxTag = count >= MAX_FRAGS ? ' ⬆️ **MAX**' : '';
    return `${rarity.emoji} **${char.name}** — ${count} / ${MAX_FRAGS} ${E.fragment}${maxTag}`;
  }).filter(Boolean);

  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`${E.fragment} ${username}'s Fragment Inventory`)
    .setDescription(lines.join('\n'))
    .setFooter({
      text: `Page ${page + 1} / ${totalPages}  ·  ${entries.length} character${entries.length !== 1 ? 's' : ''} with fragments`,
    });
}

function buildNavRow(page, totalEntries) {
  const totalPages = Math.ceil(totalEntries / PAGE_SIZE);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('finv_prev')
      .setLabel('◀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('finv_next')
      .setLabel('▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
  );
}

module.exports = {
  name: 'finv',
  description: 'View your fragment inventory · N finv',

  async execute(message) {
    const userId = message.author.id;
    if (!checkRegistered(message)) return;

    // Fetch all fragment entries, sorted by rarity then count
    const raw = q.getFragInv.all(userId);

    if (!raw.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.info)
          .setDescription(
            `${E.fragment} **No fragments yet!**\n\n` +
            `You earn fragments when you pull a character you already own.\n` +
            `Collect **15 fragments** of a character to summon them with \`N summon\`.`
          )],
      });
    }

    // Sort: rarity desc → count desc
    const entries = [...raw].sort((a, b) => {
      const ra = RARITY_ORDER[CHARACTERS[a.character_id]?.rarity ?? 'D'];
      const rb = RARITY_ORDER[CHARACTERS[b.character_id]?.rarity ?? 'D'];
      if (ra !== rb) return rb - ra;
      return b.count - a.count;
    });

    const username = message.member?.displayName ?? message.author.username;
    let page = 0;

    const reply = await message.reply({
      embeds:     [buildPage(entries, 0, username)],
      components: entries.length > PAGE_SIZE ? [buildNavRow(0, entries.length)] : [],
    });

    if (entries.length <= PAGE_SIZE) return;

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time:   300_000,
    });

    collector.on('collect', async i => {
      if (i.customId === 'finv_prev') page = Math.max(0, page - 1);
      else page = Math.min(Math.ceil(entries.length / PAGE_SIZE) - 1, page + 1);

      await i.update({
        embeds:     [buildPage(entries, page, username)],
        components: [buildNavRow(page, entries.length)],
      });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
