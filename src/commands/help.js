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
          value: '`n start` , `n profile` , `n daily` , `n ping` , `n balance` (`n bal`) , `n ramen` , `n help`',
        },
        {
          name: 'Collection',
          value: '`n pull` (`nop`) , `n mycollection` (`n mc`) , `n all` , `n cardinfo` (`n ci`) , `n mycardinfo` (`n mci`) , `n finv` , `n summon`',
        },
        {
          name: 'Team',
          value: '`n team` , `n team add <name>` , `n team remove <name>`',
        },
        {
          name: 'Progression',
          value: '`n mastery` , `n prestige` , `n craft <amount> <card>` , `n level <amount> <card>`',
        },
        {
          name: 'Battle',
          value: '`n arena` , `n battle`',
        },
        {
          name: '👑 Premium',
          value: '`n multipull` (`n mp`)',
        },
      );

    return message.reply({ embeds: [embed] });
  },
};
