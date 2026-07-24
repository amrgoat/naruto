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

    const avatarURL = message.author.displayAvatarURL({ dynamic: true, size: 128 });

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setTitle('Your ninja record has been created.')
        .setDescription(
          `You start with ${E.ryo} 5000 ryo and 3 ${E.ramen} Ramen.\n\n` +
          `Begin your journey with \`n pull\` to summon your first card.`
        )
        .setFooter({ text: username, iconURL: avatarURL })],
    });
  },
};
