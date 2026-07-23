// ─────────────────────────────────────────────
//  admin/give.js  —  N give @user <item> <amount>
//  Give any item to a player. Admin only.
//
//  Supported items: ryo, ramen, essence, expscroll
//  Usage: N give @Naruto ryo 5000
// ─────────────────────────────────────────────

const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { q }       = require('../../database');
const { COLORS }  = require('../../config');
const { ITEMS, findItem } = require('../../items');
const { errorEmbed } = require('../../utils/embeds');

// Maps item db_col → the prepared statement that adds to it
const GIVE_HANDLERS = {
  ryo:            (userId, amount) => q.addRyo.run(amount, userId),
  ramen:          (userId, amount) => q.addRamen.run(amount, userId),
  chakra_essence: (userId, amount) => q.addChakraEssence.run(amount, userId),
  exp_scrolls:    (userId, amount) => q.addExpScrolls.run(amount, userId),
};

module.exports = {
  name: 'give',
  description: '[Admin] Give an item to a user · N give @user <item> <amount>',

  async execute(message, args) {
    // ── Admin check ────────────────────────────
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ embeds: [errorEmbed('❌ Administrator permission required.')] });
    }

    // ── Parse args: N give @user <item> <amount> ──
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply({
        embeds: [errorEmbed(
          '**Usage:** `N give @user <item> <amount>`\n' +
          `**Items:** ${Object.values(ITEMS).filter(i => i.db_col).map(i => `\`${i.id}\``).join(', ')}`
        )],
      });
    }

    // Strip mention from args to get [item, amount]
    const rest = args.filter(a => !a.match(/^<@!?\d+>$/));
    const [itemQuery, rawAmount] = rest;

    if (!itemQuery || !rawAmount) {
      return message.reply({
        embeds: [errorEmbed(
          '**Usage:** `N give @user <item> <amount>`\n' +
          `**Items:** ${Object.values(ITEMS).filter(i => i.db_col).map(i => `\`${i.id}\``).join(', ')}`
        )],
      });
    }

    const item = findItem(itemQuery);
    if (!item || !item.db_col) {
      return message.reply({
        embeds: [errorEmbed(
          `Unknown item **"${itemQuery}"**.\n` +
          `**Available:** ${Object.values(ITEMS).filter(i => i.db_col).map(i => `\`${i.id}\``).join(', ')}`
        )],
      });
    }

    const amount = parseInt(rawAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > 1_000_000) {
      return message.reply({
        embeds: [errorEmbed('Amount must be a number between **1** and **1,000,000**.')],
      });
    }

    // ── Target must have an account ────────────
    const targetUser = q.getUser.get(target.id);
    if (!targetUser) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** doesn't have an account yet.`)],
      });
    }

    // ── Give item ──────────────────────────────
    GIVE_HANDLERS[item.db_col](target.id, amount);
    const fresh = q.getUser.get(target.id);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle('✅ Item Given')
        .setDescription(
          `${item.emoji} **+${amount.toLocaleString()} ${item.name}** → **${target.username}**\n\n` +
          `New balance: **${fresh[item.db_col].toLocaleString()}** ${item.name}\n` +
          `Tradable: ${item.tradable ? '🔄 Yes' : '🔒 No (soul-bound)'}`
        )],
    });
  },
};
