// ─────────────────────────────────────────────
//  ping.js  —  N ping
//  Check bot and gateway latency.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS, E }    = require('../config');

module.exports = {
  name: 'ping',
  description: 'Check bot latency.',

  async execute(message, _args, client) {
    const sent    = await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.info).setDescription('Pinging...')] });
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const ws      = Math.round(client.ws.ping);

    return sent.edit({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle(`${E.ping} Pong!`)
        .addFields(
          { name: '📨 Message Latency', value: `**${latency}ms**`, inline: true },
          { name: '🌐 Gateway',         value: `**${ws}ms**`,      inline: true },
        )],
    });
  },
};
