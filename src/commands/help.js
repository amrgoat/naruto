// ─────────────────────────────────────────────
//  help.js  —  N help
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS }       = require('../config');

module.exports = {
  name: 'help',
  description: 'Show all commands.',

  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('Naruto Bot — Commands')
      .setColor(COLORS.EMBED_COLOR)
      .addFields(
        {
          name: 'General',
          value: '`n start` , `n profile` , `n daily` , `n ping` , `n balance` , `n ramen`',
        },
        {
          name: 'Collection',
          value: '`n pull` , `n mycollection` , `n all` , `n cardinfo` , `n mycardinfo` , `n finv` , `n summon`',
        },
        {
          name: 'Team',
          value: '`n team` , `n team add` , `n team remove`',
        },
        {
          name: 'Progression',
          value: '`n mastery` , `n prestige` , `n craft` , `n level`',
        },
        {
          name: 'Battle',
          value: '`n arena` , `n battle`',
        },
        {
          name: 'Premium',
          value: '`n multipull`',
        },
      );

    return message.reply({ embeds: [embed] });
  },
};
