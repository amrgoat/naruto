// ─────────────────────────────────────────────
//  finv.js  —  t finv [rarity | name]
//
//  t finv          → full inventory, sorted by count (high → low)
//  t finv C        → only C-rarity characters
//  t finv sa       → all characters whose name contains "sa"
// ─────────────────────────────────────────────

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }              = require('../database');
const { CHARACTERS }     = require('../data/characters');
const { COLORS, RARITIES, E } = require('../config');
const { checkRegistered } = require('../utils/guards');

const PAGE_SIZE   = 12;
const FRAG_CAP    = 500;   // total fragment cap shown in footer

const RARITY_KEYS = new Set(['D', 'C', 'B', 'A', 'S', 'SS', 'UR']);

// ── Format a single list line ──────────────────
function entryLine({ character_id, count }) {
  const char = CHARACTERS[character_id];
  if (!char) return null;
  return `**${char.name}** ×**${count}** (${char.rarity})`;
}

// ── Paginated embed ────────────────────────────
function buildPage(entries, page, username, subtitle, avatarURL) {
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const slice      = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const lines      = slice.map(entryLine).filter(Boolean);
  const totalFrags = entries.reduce((s, e) => s + e.count, 0);

  return new EmbedBuilder()
    .setColor(COLORS.EMBED_COLOR)
    .setTitle(`${username}'s Fragment Inventory${subtitle ? `  ·  ${subtitle}` : ''}`)
    .setThumbnail(avatarURL)
    .setDescription(lines.join('\n') || '*Nothing here.*')
    .setFooter({ text: `${totalFrags}/${FRAG_CAP}${totalPages > 1 ? `  ·  Page ${page + 1}/${totalPages}` : ''}` });
}

function buildNavRow(page, total) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('finv_prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('finv_next').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1),
  );
}

async function paginate(message, entries, username, subtitle, avatarURL) {
  let page = 0;

  const reply = await message.reply({
    embeds:     [buildPage(entries, 0, username, subtitle, avatarURL)],
    components: entries.length > PAGE_SIZE ? [buildNavRow(0, entries.length)] : [],
  });

  if (entries.length <= PAGE_SIZE) return;

  const collector = reply.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id,
    time:   300_000,
  });

  collector.on('collect', async i => {
    if (i.customId === 'finv_prev') page = Math.max(0, page - 1);
    else page = Math.min(Math.ceil(entries.length / PAGE_SIZE) - 1, page + 1);
    await i.update({
      embeds:     [buildPage(entries, page, username, subtitle, avatarURL)],
      components: [buildNavRow(page, entries.length)],
    });
  });

  collector.on('end', () => reply.edit({ components: [] }).catch(() => {}));
}

// ── Main export ────────────────────────────────
module.exports = {
  name: 'finv',
  aliases: ['fi'],
  description: 'View fragment inventory · t finv [rarity|name]',

  async execute(message, args) {
    if (!checkRegistered(message)) return;

    const userId    = message.author.id;
    const username  = message.member?.displayName ?? message.author.username;
    const avatarURL = message.author.displayAvatarURL({ size: 128 });

    const raw = q.getFragInv.all(userId);

    // ── Empty state ────────────────────────────
    if (!raw.length) {
      const totalFrags = 0;
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle('No fragments yet!')
          .setThumbnail(avatarURL)
          .setDescription(
            `Earn fragments by pulling characters you already own.\n` +
            `Collect **15 fragments** of a character to summon them via \`t summon\`.`
          )
          .setFooter({ text: `${totalFrags}/${FRAG_CAP}` })],
      });
    }

    // Sort high → low count
    const all   = [...raw].sort((a, b) => b.count - a.count);
    const query = args.join(' ').trim();

    // ── No args → full inventory ───────────────
    if (!query) {
      return paginate(message, all, username, null, avatarURL);
    }

    // ── Rarity filter: D / C / B / A / S / SS / UR ──
    const rarityKey = query.toUpperCase();
    if (RARITY_KEYS.has(rarityKey)) {
      const filtered = all.filter(e => CHARACTERS[e.character_id]?.rarity === rarityKey);

      if (!filtered.length) {
        const rar = RARITIES[rarityKey];
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(COLORS.EMBED_COLOR)
            .setThumbnail(avatarURL)
            .setDescription(`${rar?.emoji ?? rarityKey} No **${rar?.label ?? rarityKey}** fragments in your inventory.`)
            .setFooter({ text: `${all.reduce((s, e) => s + e.count, 0)}/${FRAG_CAP}` })],
        });
      }

      return paginate(message, filtered, username, RARITIES[rarityKey]?.label ?? rarityKey, avatarURL);
    }

    // ── Name search → all matching entries ────
    const needle  = query.toLowerCase();
    const matches = all.filter(e => {
      const name = CHARACTERS[e.character_id]?.name?.toLowerCase() ?? '';
      return name.includes(needle);
    });

    if (!matches.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setThumbnail(avatarURL)
          .setDescription(`${E.fragment} No fragments found matching **"${query}"**.`)
          .setFooter({ text: `${all.reduce((s, e) => s + e.count, 0)}/${FRAG_CAP}` })],
      });
    }

    return paginate(message, matches, username, `"${query}"`, avatarURL);
  },
};
