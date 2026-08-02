// ─────────────────────────────────────────────
//  inventory.js  —  N inventory | N inv
//  Shows the player's consumable inventory.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS, E }    = require('../config');
const { checkRegistered } = require('../utils/guards');

// ── Scrolls ────────────────────────────────────
const SCROLL_ITEMS = [
  { key: 'exp_scrolls',     label: '📜 EXP Scroll'             },
  { key: 'academy_scrolls', label: '📜 Academy Scroll'          },
  { key: 'chunin_scrolls',  label: '📜 Chunin Scroll'           },
  { key: 'mission_scrolls', label: '📜 Mission Scroll'          },
  { key: 'jonin_scrolls',   label: '📜 Jonin Scroll'            },
  { key: 'anbu_scrolls',    label: '📜 ANBU Scroll'             },
  { key: 'hokage_scrolls',  label: '📜 Hokage Scroll'           },
];

// ── Trial tickets ──────────────────────────────
const TICKET_ITEMS = [
  { key: 'academy_trial_tickets', label: '📚 Academy Trial Ticket' },
  { key: 'chunin_trial_tickets',  label: '🟦 Chunin Trial Ticket'  },
  { key: 'jonin_trial_tickets',   label: '🟧 Jonin Trial Ticket'   },
  { key: 'anbu_trial_tickets',    label: '🔴 ANBU Trial Ticket'    },
];

module.exports = {
  name:    'inventory',
  aliases: ['inv'],
  description: 'Check your consumable inventory · N inventory',

  async execute(message) {
    const user     = checkRegistered(message);
    if (!user) return;

    const username = message.member?.displayName ?? message.author.username;

    // ── Scrolls section ────────────────────────
    const scrollLines = SCROLL_ITEMS
      .map(item => {
        const count = user[item.key] ?? 0;
        if (!count) return null;
        return `${item.label} ×**${count.toLocaleString()}**`;
      })
      .filter(Boolean);

    // ── Tickets section ────────────────────────
    const ticketLines = TICKET_ITEMS
      .map(item => {
        const count = user[item.key] ?? 0;
        if (!count) return null;
        return `${item.label} ×**${count.toLocaleString()}**`;
      })
      .filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(COLORS.EMBED_COLOR)
      .setTitle(`${username}'s Inventory`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 128 }));

    if (scrollLines.length) {
      embed.addFields({ name: '📜 Scrolls', value: scrollLines.join('\n') });
    }
    if (ticketLines.length) {
      embed.addFields({ name: '🎫 Trial Tickets', value: ticketLines.join('\n') });
    }
    if (!scrollLines.length && !ticketLines.length) {
      embed.setDescription('*Your inventory is empty.*');
    }

    return message.reply({ embeds: [embed] });
  },
};
