// ─────────────────────────────────────────────
//  inventory.js  —  N inventory | N inv
//  Shows the player's consumable inventory.
//  Add new sections below the existing ones
//  as more item types are introduced.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS, E, ARROW_EMOJI } = require('../config');
const { checkRegistered }        = require('../utils/guards');

// All trackable items in display order.
// Add new entries here as more item types are introduced.
const INVENTORY_ITEMS = [
  { key: 'exp_scrolls',     label: 'EXP Scroll'             },
  { key: 'academy_scrolls', label: 'Academy Scroll'          },
  { key: 'chunin_scrolls',  label: 'Chunin Mission Scroll'   },
  { key: 'mission_scrolls', label: 'Mission Scroll'          },
  { key: 'jonin_scrolls',   label: 'Jonin Mission Scroll'    },
  { key: 'anbu_scrolls',    label: 'ANBU Classified Scroll'  },
  { key: 'hokage_scrolls',  label: 'Hokage Secret Scroll'    },
];

module.exports = {
  name:    'inventory',
  aliases: ['inv'],
  description: 'Check your consumable inventory · N inventory',

  async execute(message) {
    const user     = checkRegistered(message);
    if (!user) return;

    const username = message.member?.displayName ?? message.author.username;

    const lines = INVENTORY_ITEMS
      .map(item => {
        const count = user[item.key] ?? 0;
        if (!count) return null;
        return `${item.label} ×**${count.toLocaleString()}**`;
      })
      .filter(Boolean);

    const desc = lines.length
      ? lines.join('\n')
      : '*Your inventory is empty.*';

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle(`${username}'s Inventory`)
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 128 }))
          .setDescription(desc),
      ],
    });
  },
};
