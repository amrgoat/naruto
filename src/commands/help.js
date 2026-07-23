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
          value: '`n start` , `n profile` , `n daily` , `n ping` , `n bal` , `n ramen` , `n help`',
        },
        {
          name: 'Collection',
          value: '`n pull` , `n cards` , `n card` , `n all` , `n ci` , `n mci` , `n summon` , `n finv`',
        },
        {
          name: 'Team',
          value: '`n team` , `n team add <name>` , `n team remove <name>`',
        },
        {
          name: 'Progression',
          value: '`n mastery` , `n prestige` , `n craft <amount> <card>`',
        },
        {
          name: 'Battle',
          value: '`n arena` , `n battle`',
        },
        {
          name: '👑 Premium',
          value: '`n mp`',
        },
      );

    return message.reply({ embeds: [embed] });
  },
};
