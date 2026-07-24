// ─────────────────────────────────────────────
//  bal.js  —  N bal
//  Shows the user's full wallet / item balances.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, COMBAT_EMOJIS, E, ARROW_EMOJI, WALLET_EMOJI } = require('../config');
const { ITEMS }        = require('../items');
const { checkRegistered } = require('../utils/guards');

module.exports = {
  name: 'balance',
  aliases: ['bal'],
  description: 'Check your wallet and item balances · N balance',

  async execute(message) {
    const user = checkRegistered(message);
    if (!user) return;

    const username = message.member?.displayName ?? message.author.username;

    // Fragment count: total across all characters
    const fragRows   = q.getFragInv.all(message.author.id);
    const totalFrags = fragRows.reduce((s, r) => s + r.count, 0);
    const charCount  = fragRows.length;

    const tradableTag    = '🔄';
    const boundTag       = '🔒';

    const embed = new EmbedBuilder()
      .setColor(COLORS.EMBED_COLOR)
      .setTitle(`${username}'s Wallet`)
      .setDescription([
        `${WALLET_EMOJI} **Wallet:**`,
        `${ARROW_EMOJI} Ryo: **${user.ryo.toLocaleString()}** ${COMBAT_EMOJIS.ryo}`,
        `${ARROW_EMOJI} Ramen: **${user.ramen}** ${E.ramen}`,
        `${ARROW_EMOJI} Chakra Essence: **${user.chakra_essence.toLocaleString()}** ${COMBAT_EMOJIS.essence}`,
      ].join('\n'));

    return message.reply({ embeds: [embed] });
  },
};
