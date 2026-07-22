// ─────────────────────────────────────────────
//  summon.js  —  N summon <character>
//  Spend 15 fragments of a character you don't
//  own to permanently add them to your collection.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { CHARACTERS }   = require('../data/characters');
const { COLORS, RARITIES, E } = require('../config');
const { checkRegistered } = require('../utils/guards');
const { errorEmbed }   = require('../utils/embeds');

const SUMMON_COST = 15;

/** Case-insensitive name/id lookup */
function findCharacter(query) {
  const norm = query.toLowerCase().replace(/\s+/g, ' ').trim();
  return Object.values(CHARACTERS).find(c =>
    c.name.toLowerCase() === norm ||
    c.id.toLowerCase()   === norm ||
    c.name.toLowerCase().replace(/\s+/g, '') === norm.replace(/\s+/g, '')
  );
}

module.exports = {
  name: 'summon',
  description: `Summon a card using ${SUMMON_COST} fragments · N summon <character>`,

  async execute(message, args) {
    const userId = message.author.id;
    if (!checkRegistered(message)) return;

    if (!args.length) {
      return message.reply({
        embeds: [errorEmbed(
          `**Usage:** \`N summon <character name>\`\n` +
          `Example: \`N summon Naruto\`\n\n` +
          `Check your fragments with \`N finv\`.`
        )],
      });
    }

    const query = args.join(' ');
    const char  = findCharacter(query);

    if (!char) {
      return message.reply({
        embeds: [errorEmbed(
          `No character found for **"${query}"**.\n` +
          `Check spelling or use \`N all\` to browse all characters.`
        )],
      });
    }

    // ── Already own it? ────────────────────────
    const owned = q.getCardByCharacter.get(userId, char.id);
    if (owned) {
      return message.reply({
        embeds: [errorEmbed(
          `You already own **${char.name}**!\n` +
          `Duplicate pulls add fragments to your \`N finv\` instead.`
        )],
      });
    }

    // ── Check fragment balance ─────────────────
    const entry = q.getFragEntry.get(userId, char.id);
    const count = entry?.count ?? 0;

    if (count < SUMMON_COST) {
      const rarity = RARITIES[char.rarity] ?? RARITIES.D;
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(
            `${rarity.emoji} **${char.name}**\n\n` +
            `You need **${SUMMON_COST} ${E.fragment} fragments** to summon this card.\n` +
            `You currently have **${count} / ${SUMMON_COST}**.\n\n` +
            `Pull duplicates of ${char.name} to collect more fragments.`
          )],
      });
    }

    // ── Deduct fragments & create card ─────────
    q.deductFrag.run(SUMMON_COST, userId, char.id);
    const result = q.insertCard.run(userId, char.id);
    const card   = q.getCard.get(result.lastInsertRowid);

    const rarity    = RARITIES[char.rarity] ?? RARITIES.D;
    const remaining = count - SUMMON_COST;

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(rarity.color)
        .setTitle(`✅ Summoned — ${char.name}!`)
        .setThumbnail(rarity.thumb ?? null)
        .setImage(char.image)
        .setDescription(
          `${rarity.emoji} **${rarity.label}** · ${char.name}\n\n` +
          `${char.description}\n\n` +
          `**${SUMMON_COST} ${E.fragment} fragments** spent.\n` +
          `Remaining fragments: **${remaining}**`
        )
        .setFooter({ text: `Use N card ${char.name} to view your new card.` })],
    });
  },
};
