// ─────────────────────────────────────────────
//  card.js  —  N card <name>
//  View detailed stats for one of your cards.
// ─────────────────────────────────────────────

const { q }            = require('../database');
const { CHARACTERS }   = require('../data/characters');
const { checkRegistered } = require('../utils/guards');
const { buildCardEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  name: 'card',
  description: 'View a card · N card <character name>',

  async execute(message, args) {
    const user = checkRegistered(message);
    if (!user) return;

    if (!args.length) {
      return message.reply({ embeds: [errorEmbed('Usage: `N card <character name>`')] });
    }

    const query  = args.join(' ').toLowerCase();
    const userId = message.author.id;
    const cards  = q.getUserCards.all(userId);

    const card = cards.find(c => {
      const char = CHARACTERS[c.character_id];
      return (
        char?.name.toLowerCase().includes(query) ||
        c.character_id.toLowerCase().replace(/_/g, ' ').includes(query)
      );
    });

    if (!card) {
      return message.reply({
        embeds: [errorEmbed(
          `No card found matching \`${args.join(' ')}\`.\n` +
          `Use \`N cards\` to browse your collection.`
        )],
      });
    }

    return message.reply({ embeds: [buildCardEmbed(card)] });
  },
};
