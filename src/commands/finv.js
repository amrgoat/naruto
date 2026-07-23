// ─────────────────────────────────────────────
//  finv.js  —  N finv [rarity | name]
//
//  N finv          → full inventory, sorted by count (high → low)
//  N finv C        → only C-rarity characters
//  N finv Naruto   → single character lookup
// ─────────────────────────────────────────────

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }              = require('../database');
const { CHARACTERS }     = require('../data/characters');
const { COLORS, RARITIES, E } = require('../config');
const { checkRegistered } = require('../utils/guards');

const PAGE_SIZE   = 12;
const MAX_FRAGS   = 500;
const SUMMON_COST = 15;

const RARITY_ORDER = { D: 0, C: 1, B: 2, A: 3, S: 4, SS: 5, UR: 6 };
const RARITY_KEYS  = new Set(Object.keys(RARITY_ORDER));

// ── Sort: highest count first ──────────────────
function sortEntries(entries) {
  return [...entries].sort((a, b) => b.count - a.count);
}

// ── Single list line ───────────────────────────
function entryLine({ character_id, count }) {
  const char   = CHARACTERS[character_id];
  if (!char) return null;
  const rarity = RARITIES[char.rarity] ?? RARITIES.D;
  const maxTag = count >= MAX_FRAGS ? ' ⬆️ MAX' : '';
  return `${rarity.emoji} **${char.name}** (${char.rarity}) — ${count}/${MAX_FRAGS} ${E.fragment}${maxTag}`;
}

// ── Paginated embed ────────────────────────────
function buildPage(entries, page, username, subtitle) {
  const totalPages  = Math.ceil(entries.length / PAGE_SIZE);
  const slice       = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const lines       = slice.map(entryLine).filter(Boolean);
  const totalFrags  = entries.reduce((s, e) => s + e.count, 0);
  const totalCap    = entries.length * MAX_FRAGS;

  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`${E.fragment} ${username}'s Fragment Inventory${subtitle ? `  ·  ${subtitle}` : ''}`)
    .setDescription(lines.join('\n') || '*Nothing here.*')
    .setFooter({
      text: [
        `Page ${page + 1}/${totalPages}`,
        `${entries.length} character${entries.length !== 1 ? 's' : ''}`,
        `Total: ${totalFrags.toLocaleString()}/${totalCap.toLocaleString()} ${E.fragment}`,
      ].join('  ·  '),
    });
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

// ── Paginator helper ───────────────────────────
async function paginate(message, entries, username, subtitle) {
  let page = 0;

  const reply = await message.reply({
    embeds:     [buildPage(entries, 0, username, subtitle)],
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
      embeds:     [buildPage(entries, page, username, subtitle)],
      components: [buildNavRow(page, entries.length)],
    });
  });

  collector.on('end', () => reply.edit({ components: [] }).catch(() => {}));
}

// ── Main export ────────────────────────────────
module.exports = {
  name: 'finv',
  description: 'View fragment inventory · N finv [rarity|name]',

  async execute(message, args) {
    if (!checkRegistered(message)) return;

    const userId   = message.author.id;
    const username = message.member?.displayName ?? message.author.username;

    const raw = q.getFragInv.all(userId);

    // ── Empty state ────────────────────────────
    if (!raw.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.info)
          .setDescription(
            `${E.fragment} **No fragments yet!**\n\n` +
            `Earn fragments by pulling characters you already own.\n` +
            `Collect **${SUMMON_COST} fragments** of a character to summon them via \`N summon\`.`
          )],
      });
    }

    const all   = sortEntries(raw);   // always high → low count
    const query = args.join(' ').trim();

    // ── No args → full inventory ───────────────
    if (!query) {
      return paginate(message, all, username, null);
    }

    // ── Rarity filter: D / C / B / A / S / SS / UR ──
    const rarityKey = query.toUpperCase();
    if (RARITY_KEYS.has(rarityKey)) {
      const filtered = all.filter(e => CHARACTERS[e.character_id]?.rarity === rarityKey);

      if (!filtered.length) {
        const rar = RARITIES[rarityKey];
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(COLORS.info)
            .setDescription(`${rar.emoji} No **${rar.label}** fragments in your inventory.`)],
        });
      }

      return paginate(message, filtered, username, RARITIES[rarityKey].label);
    }

    // ── Name search → single character embed ───
    const needle = query.toLowerCase();
    const match  = all.find(e => {
      const name = CHARACTERS[e.character_id]?.name?.toLowerCase() ?? '';
      return name === needle || name.includes(needle);
    });

    if (!match) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.info)
          .setDescription(`${E.fragment} No fragments found for **"${query}"**.`)],
      });
    }

    const char   = CHARACTERS[match.character_id];
    const rarity = RARITIES[char.rarity] ?? RARITIES.D;
    const needed = Math.max(0, SUMMON_COST - match.count);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(rarity.color)
        .setTitle(`${rarity.emoji} ${char.name} (${char.rarity})`)
        .setThumbnail(char.image ?? null)
        .addFields(
          {
            name:   `${E.fragment} Fragments`,
            value:  `**${match.count}** / ${MAX_FRAGS}`,
            inline: true,
          },
          {
            name:   '✨ Summon',
            value:  needed === 0 ? '✅ Ready! Use `N summon`' : `**${needed}** more to summon`,
            inline: true,
          },
        )
        .setFooter({ text: `${match.count}/${MAX_FRAGS} fragments  ·  ${match.count >= SUMMON_COST ? 'Can summon now' : `Need ${needed} more`}` })],
    });
  },
};
