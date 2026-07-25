// ─────────────────────────────────────────────
//  admin/give.js  —  N give @user <amount> <item>
//  Give any item or character fragments to a player. Owner only.
//
//  Examples:
//    N give @user 500 ryo
//    N give @user 10 Naruto       → 10 Naruto fragments
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../../database');
const { COLORS, E }    = require('../../config');
const { ITEMS, findItem } = require('../../items');
const { CHARACTERS }   = require('../../data/characters');
const { errorEmbed }   = require('../../utils/embeds');
const { isOwner }      = require('../../utils/owner');

const GIVE_HANDLERS = {
  ryo:            (userId, amount) => q.addRyo.run(amount, userId),
  ramen:          (userId, amount) => q.addRamen.run(amount, userId),
  chakra_essence: (userId, amount) => q.addChakraEssence.run(amount, userId),
  exp_scrolls:    (userId, amount) => q.addExpScrolls.run(amount, userId),
};

/** Find a character by exact name or id (case-insensitive). */
function findCharacter(query) {
  const q = query.toLowerCase().trim();
  return Object.values(CHARACTERS).find(c =>
    c.id === q || c.name.toLowerCase() === q
  ) ?? null;
}

module.exports = {
  name: 'give',
  description: '[Admin] Give an item or fragments to a user · N give @user <amount> <item>',

  async execute(message, args) {
    if (!isOwner(message.author.id)) return;

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply({
        embeds: [errorEmbed(
          '**Usage:** `N give @user <amount> <item>`\n' +
          `**Items:** ${Object.values(ITEMS).filter(i => i.db_col).map(i => `\`${i.id}\``).join(', ')}, or a character name for fragments`
        )],
      });
    }

    // Strip the mention, then split into amount + item (item may be multi-word)
    const rest = args.filter(a => !a.match(/^<@!?\d+>$/));
    const [rawAmount, ...itemParts] = rest;
    const itemQuery = itemParts.join(' ').trim();

    if (!rawAmount || !itemQuery) {
      return message.reply({
        embeds: [errorEmbed(
          '**Usage:** `N give @user <amount> <item>`\n' +
          `**Items:** ${Object.values(ITEMS).filter(i => i.db_col).map(i => `\`${i.id}\``).join(', ')}, or a character name for fragments`
        )],
      });
    }

    const amount = parseInt(rawAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > 1_000_000) {
      return message.reply({
        embeds: [errorEmbed('Amount must be a number between **1** and **1,000,000**.')],
      });
    }

    const targetUser = q.getUser.get(target.id);
    if (!targetUser) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** doesn't have an account yet.`)],
      });
    }

    // ── Check regular items first ──────────────────
    const item = findItem(itemQuery);
    if (item && item.db_col) {
      GIVE_HANDLERS[item.db_col](target.id, amount);
      const fresh = q.getUser.get(target.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle('✅ Item Given')
          .setDescription(
            `${item.emoji} **+${amount.toLocaleString()} ${item.name}** → **${target.username}**\n\n` +
            `New balance: **${fresh[item.db_col].toLocaleString()}** ${item.name}`
          )],
      });
    }

    // ── Fragment give — look up by character name ──
    const char = findCharacter(itemQuery);
    if (char) {
      // setFrag upserts: INSERT ... ON CONFLICT DO UPDATE SET count = MIN(count + ?, 500)
      q.setFrag.run(target.id, char.id, amount, amount);
      const entry = q.getFragEntry.get(target.id, char.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle('✅ Fragments Given')
          .setDescription(
            `${E.fragment} **+${amount.toLocaleString()} ${char.name} Fragments** → **${target.username}**\n\n` +
            `New total: **${entry?.count ?? amount}** ${char.name} Fragments`
          )],
      });
    }

    // ── Nothing matched ────────────────────────────
    return message.reply({
      embeds: [errorEmbed(
        `Unknown item or character **"${itemQuery}"**.\n` +
        `**Items:** ${Object.values(ITEMS).filter(i => i.db_col).map(i => `\`${i.id}\``).join(', ')}\n` +
        `For fragments, use the character's name (e.g. \`Naruto\`, \`Kakashi\`).`
      )],
    });
  },
};
