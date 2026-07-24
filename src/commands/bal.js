// ─────────────────────────────────────────────
//  bal.js  —  N bal
//  Shows the user's full wallet / item balances.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, COMBAT_EMOJIS, E } = require('../config');
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
      .setTitle(`${COMBAT_EMOJIS.ryo} ${username}'s Wallet`)
      .addFields(
        {
          name:   `${COMBAT_EMOJIS.ryo} Ryo  ${tradableTag}`,
          value:  `**${user.ryo.toLocaleString()}**`,
          inline: true,
        },
        {
          name:   `${E.ramen} Ramen  ${tradableTag}`,
          value:  `**${user.ramen}**`,
          inline: true,
        },
        {
          name:   `${E.scroll} EXP Scrolls  ${tradableTag}`,
          value:  `**${user.exp_scrolls}**`,
          inline: true,
        },
        {
          name:   `${COMBAT_EMOJIS.essence} Chakra Essence  ${boundTag}`,
          value:  `**${user.chakra_essence.toLocaleString()}**`,
          inline: true,
        },
        {
          name:   `${E.fragment} Fragments  ${boundTag}`,
          value:  `**${totalFrags.toLocaleString()}** across **${charCount}** character${charCount !== 1 ? 's' : ''}`,
          inline: true,
        },
      )
      .setFooter({ text: `${tradableTag} Tradable  ·  ${boundTag} Soul-bound` });

    return message.reply({ embeds: [embed] });
  },
};
