// ─────────────────────────────────────────────
//  admin/resetdaily.js  —  N resetdaily [@user]
//  Resets the daily claim timer for a user.
//  Owner only.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../../database');
const { COLORS }       = require('../../config');
const { errorEmbed }   = require('../../utils/embeds');
const { isOwner }      = require('../../utils/owner');

module.exports = {
  name: 'resetdaily',
  description: '[Admin] Reset a user\'s daily claim timer · N resetdaily [@user]',

  async execute(message, args) {
    if (!isOwner(message.author.id)) return;

    const mention = message.mentions.users.first();
    const target  = mention ?? message.author;

    const user = q.getUser.get(target.id);
    if (!user) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** doesn't have an account yet.`)],
      });
    }

    q.setDailyReset.run(0, target.id);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setDescription(
          `✅ Daily timer reset for **${target.username}**.\n` +
          `They can now claim \`N daily\` immediately.`
        )],
    });
  },
};
