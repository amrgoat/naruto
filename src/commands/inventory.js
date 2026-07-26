// ─────────────────────────────────────────────
//  inventory.js  —  N inventory | N inv
//  Shows the player's consumable inventory.
//  Add new sections below the existing ones
//  as more item types are introduced.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS, E, ARROW_EMOJI } = require('../config');
const { checkRegistered }        = require('../utils/guards');

// Scroll tier display order (weakest → strongest)
const SCROLL_TIERS = [
  { key: 'academy_scrolls', label: 'Academy Scroll'        },
  { key: 'chunin_scrolls',  label: 'Chunin Mission Scroll' },
  { key: 'mission_scrolls', label: 'Mission Scroll'        },
  { key: 'jonin_scrolls',   label: 'Jonin Mission Scroll'  },
  { key: 'anbu_scrolls',    label: 'ANBU Classified Scroll'},
  { key: 'hokage_scrolls',  label: 'Hokage Secret Scroll'  },
];

module.exports = {
  name:    'inventory',
  aliases: ['inv'],
  description: 'Check your consumable inventory · N inventory',

  async execute(message) {
    const user     = checkRegistered(message);
    if (!user) return;

    const username = message.member?.displayName ?? message.author.username;

    // ── EXP Scrolls ─────────────────────────────
    const expScrollLines = [
      `${E.scroll} **EXP Scrolls**`,
      `${ARROW_EMOJI} **${(user.exp_scrolls ?? 0).toLocaleString()}x** EXP Scroll`,
    ];

    // ── Mission Scrolls ──────────────────────────
    const scrollLines = SCROLL_TIERS.map(tier => {
      const count = user[tier.key] ?? 0;
      return `${ARROW_EMOJI} **${count.toLocaleString()}x** ${tier.label}`;
    });

    const desc = [
      ...expScrollLines,
      '',
      `📜 **Scrolls**`,
      ...scrollLines,
    ].join('\n');

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
