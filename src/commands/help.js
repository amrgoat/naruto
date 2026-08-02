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
      .setTitle('🍃 Naruto Bot — Commands')
      .setColor(COLORS.EMBED_COLOR)
      .setFooter({ text: 'Prefix: t  (or T, with or without a space)' })
      .addFields(
        {
          name: '⚙️ General',
          value: '`t start` · `t profile` · `t daily` · `t balance` · `t ping` · `t ramen`',
        },
        {
          name: '📜 Collection',
          value:
            '`t pull` · `t mycollection` `(mc)` · `t all` · `t cardinfo` `(ci)` · `t mycardinfo` `(mci)` · `t finv` · `t summon` · `t open`',
        },
        {
          name: '🥷 Team',
          value: '`t team` · `t team add <name>` · `t team remove <name>`',
        },
        {
          name: '📈 Progression',
          value: '`t mastery` · `t prestige` · `t craft` · `t level`',
        },
        {
          name: '⚔️ Battle',
          value: '`t arena` · `t battle @user`',
        },
        {
          name: '🏯 Trials',
          value:
            '`t trial1` — 📚 Academy  *(easiest)*\n' +
            '`t trial2` — 🟦 Chunin\n' +
            '`t trial3` — 🟧 Jonin\n' +
            '`t trial4` — 🔴 ANBU  *(hardest · best rewards)*\n' +
            '*Requires a Trial Ticket — buy from shop or earn from missions.*',
        },
        {
          name: '🛒 Economy',
          value:
            '`t shop` · `t shop buy <amt> <item>` · `t inventory` `(inv)` · `t mission` · `t expedition` `(exp)`',
        },
        {
          name: '💎 Premium',
          value: '`t multipull` `(mp)`',
        },
      );

    return message.reply({ embeds: [embed] });
  },
};
