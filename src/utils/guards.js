// ─────────────────────────────────────────────
//  guards.js  —  Pre-command validation helpers
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q } = require('../database');
const { COLORS } = require('../config');

/**
 * Checks that the message author has a registered account.
 * If not, sends an error embed and returns null.
 * Returns the user row on success.
 * @param {import('discord.js').Message} message
 */
function checkRegistered(message) {
  const user = q.getUser.get(message.author.id);
  if (!user) {
    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setDescription('You don\'t have an account yet.\nRun **N start** to begin your ninja journey.')],
    }).catch(() => {});
    return null;
  }
  return user;
}

module.exports = { checkRegistered };
