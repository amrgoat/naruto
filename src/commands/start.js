// ─────────────────────────────────────────────
//  start.js  —  N start
//  Creates a new player account.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, E, PULLS_PER_PERIOD, STARTING_RAMEN } = require('../config');
const { errorEmbed }   = require('../utils/embeds');

module.exports = {
  name: 'start',
  description: 'Register and begin your ninja journey.',

  async execute(message) {
    const { id, username } = message.author;

    // INSERT OR IGNORE — result.changes = 0 means already registered
    const result = q.insertUser.run(id, username);

    if (result.changes === 0) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle(`${E.leaf} Already Registered`)
          .setDescription(
            `You already have a ninja profile, **${username}**.\n` +
            `Use \`N profile\` to view your stats.`
          )],
      });
    }

    // Keep username fresh for future lookups
    q.updateUsername.run(username, id);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setTitle(`${E.leaf} Welcome to the Hidden Leaf!`)
        .setDescription(
          `Your ninja record has been created, **${username}**.\n\n` +
          `You start with **${PULLS_PER_PERIOD} pulls** and **${STARTING_RAMEN} ${E.ramen} Ramen**.\n\n` +
          `Begin your journey with \`N pull\` to summon your first card.`
        )
        .addFields(
          { name: `${E.pull} Pulls`,  value: `**${PULLS_PER_PERIOD}**`, inline: true },
          { name: `${E.ramen} Ramen`, value: `**${STARTING_RAMEN}**`,   inline: true },
        )],
    });
  },
};
