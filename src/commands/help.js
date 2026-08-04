// ─────────────────────────────────────────────
//  help.js  —  n help
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
      .setFooter({ text: 'Prefix: n' })
      .addFields(
        {
          name: 'General',
          value: '`n start`, `n profile`, `n daily`, `n balance`, `n ping`, `n ramen`',
        },
        {
          name: 'Collection',
          value:
            '`n pull`, `n mycollection`, `n all`, `n cardinfo`, `n mycardinfo`, `n finv`, `n summon`, `n open`',
        },
        {
          name: 'Team',
          value: '`n team`, `n team add <name>`, `n team remove <name>`',
        },
        {
          name: 'Progression',
          value: '`n mastery`, `n prestige`, `n craft`, `n level`',
        },
        {
          name: 'Battle',
          value: '`n arena`, `n battle @user`',
        },
        {
          name: 'Trials',
          value:
            '`n trial1` — Academy  *(easiest)*\n' +
            '`n trial2` — Chunin\n' +
            '`n trial3` — Jonin\n' +
            '`n trial4` — ANBU  *(hardest · best rewards)*\n' +
            '*Requires a Trial Ticket — buy from shop or earn from missions.*',
        },
        {
          name: 'Economy',
          value:
            '`n shop`, `n shop buy <amount> <item>`, `n inventory`, `n mission`, `n expedition`',
        },
        {
          name: 'Premium',
          value: '`n multipull`',
        },
      );

    return message.reply({ embeds: [embed] });
  },
};
