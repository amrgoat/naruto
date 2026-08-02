// ─────────────────────────────────────────────
//  inventory.js  —  N inventory | N inv
//  Shows the player's consumable inventory.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS }       = require('../config');
const { checkRegistered } = require('../utils/guards');

// ── Scrolls ────────────────────────────────────
const SCROLL_ITEMS = [
  { key: 'exp_scrolls',     label: 'EXP Scroll'      },
  { key: 'academy_scrolls', label: 'Academy Scroll'   },
  { key: 'chunin_scrolls',  label: 'Chunin Scroll'    },
  { key: 'mission_scrolls', label: 'Mission Scroll'   },
  { key: 'jonin_scrolls',   label: 'Jonin Scroll'     },
  { key: 'anbu_scrolls',    label: 'ANBU Scroll'      },
  { key: 'hokage_scrolls',  label: 'Hokage Scroll'    },
];

// ── Trial tickets ──────────────────────────────
const TICKET_ITEMS = [
  { key: 'academy_trial_tickets', label: 'Academy Trial Ticket' },
  { key: 'chunin_trial_tickets',  label: 'Chunin Trial Ticket'  },
  { key: 'jonin_trial_tickets',   label: 'Jonin Trial Ticket'   },
  { key: 'anbu_trial_tickets',    label: 'ANBU Trial Ticket'    },
];

module.exports = {
  name:    'inventory',
  aliases: ['inv'],
  description: 'Check your consumable inventory · N inventory | N inv',

  async execute(message) {
    const user     = checkRegistered(message);
    if (!user) return;

    const username = message.member?.displayName ?? message.author.username;

    // ── Build a single flat item list ──────────
    const lines = [];

    for (const item of SCROLL_ITEMS) {
      const count = user[item.key] ?? 0;
      if (count) lines.push(`${item.label} ×**${count.toLocaleString()}**`);
    }

    for (const item of TICKET_ITEMS) {
      const count = user[item.key] ?? 0;
      if (count) lines.push(`${item.label} ×**${count.toLocaleString()}**`);
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.EMBED_COLOR)
      .setTitle(`${username}'s Inventory`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 128 }))
      .setDescription(lines.length ? lines.join('\n') : '*Your inventory is empty.*');

    return message.reply({ embeds: [embed] });
  },
};
