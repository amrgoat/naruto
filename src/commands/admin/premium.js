// ─────────────────────────────────────────────
//  admin/premium.js  —  N premium add @user <time> | remove @user
//  Grant or revoke premium for a user.
//  Owner only.
//
//  Time examples: 7d, 30d, permanent
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../../database');
const { COLORS }       = require('../../config');
const { errorEmbed }   = require('../../utils/embeds');
const { isOwner }      = require('../../utils/owner');

/**
 * Parse a duration string like "7d", "30d", "permanent" into ms offset.
 * Returns null if unparseable.
 */
function parseDuration(str) {
  if (!str) return null;
  if (str === 'permanent' || str === 'perm' || str === '∞') return 0; // 0 = never expires
  const match = str.match(/^(\d+)d$/i);
  if (match) return parseInt(match[1], 10) * 24 * 60 * 60 * 1000;
  return null;
}

module.exports = {
  name: 'premium',
  description: '[Admin] Grant or revoke premium · N premium add @user <time> | remove @user',

  async execute(message, args) {
    if (!isOwner(message.author.id)) return;

    const sub    = args[0]?.toLowerCase();
    const target = message.mentions.users.first();

    if (!sub || !target || (sub !== 'add' && sub !== 'remove')) {
      return message.reply({
        embeds: [errorEmbed(
          '**Usage:**\n' +
          '`N premium add @user <7d | 30d | permanent>`\n' +
          '`N premium remove @user`'
        )],
      });
    }

    const targetUser = q.getUser.get(target.id);
    if (!targetUser) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** doesn't have an account yet.`)],
      });
    }

    if (sub === 'remove') {
      q.setPremium.run(0, 0, target.id);
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setDescription(`❌ Premium removed from **${target.username}**.`)],
      });
    }

    // sub === 'add'
    const timeArg  = args.find(a => !a.match(/^<@!?\d+>$/) && a !== 'add');
    const duration = parseDuration(timeArg);

    if (duration === null) {
      return message.reply({
        embeds: [errorEmbed('Invalid time. Use `7d`, `30d`, or `permanent`.')],
      });
    }

    const expiresAt = duration === 0 ? 0 : Date.now() + duration;
    q.setPremium.run(1, expiresAt, target.id);

    const expLabel = expiresAt === 0 ? 'never (permanent)' : `<t:${Math.floor(expiresAt / 1000)}:R>`;

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setDescription(`✅ **${target.username}** is now a Jinchūriki.\nExpires: ${expLabel}`)],
    });
  },
};
