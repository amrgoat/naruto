// ─────────────────────────────────────────────
//  ramen.js  —  N ramen
//  Consumes 1 Ramen to restore all 12 pulls.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, E, PULLS_PER_PERIOD } = require('../config');
const { checkRegistered }  = require('../utils/guards');
const { errorEmbed }       = require('../utils/embeds');

module.exports = {
  name: 'ramen',
  description: 'Use 1 Ramen to restore all 12 pulls.',

  async execute(message) {
    const user = checkRegistered(message);
    if (!user) return;

    if (user.ramen <= 0) {
      return message.reply({
        embeds: [errorEmbed(
          `You have no ${E.ramen} Ramen left.\n` +
          `Ramen can be obtained through events and rewards.`
        )],
      });
    }

    if (user.pulls_remaining >= PULLS_PER_PERIOD) {
      return message.reply({
        embeds: [errorEmbed(
          `You already have **${user.pulls_remaining}** pulls — your bowl is full!\n` +
          `Save your Ramen for when you run out.`
        )],
      });
    }

    // Restore pulls and consume 1 ramen
    q.ramenRestorePulls.run(message.author.id);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setTitle(`${E.ramen} Delicious!`)
        .setDescription(
          `The ramen restored your energy.\n` +
          `You can pull again.\n\n` +
          `**Pulls restored:** ${PULLS_PER_PERIOD} / ${PULLS_PER_PERIOD}`
        )
        .addFields(
          { name: `${E.ramen} Ramen Left`, value: `**${user.ramen - 1}**`, inline: true },
          { name: `${E.pull} Pulls`,       value: `**${PULLS_PER_PERIOD}**`, inline: true },
        )],
    });
  },
};
