// ─────────────────────────────────────────────
//  mci.js  —  N mci <name>  (My Card Info)
//  Show one of your owned cards with all active
//  passive bonuses applied (Choji HP, Rock Lee SPD).
// ─────────────────────────────────────────────

const { q }                         = require('../database');
const { CHARACTERS }                = require('../data/characters');
const { checkRegistered }           = require('../utils/guards');
const { resolvePassiveBonuses }     = require('../utils/passives');
const { buildMyCardInfoEmbed, errorEmbed } = require('../utils/embeds');

module.exports = {
  name: 'mycardinfo',
  aliases: ['mci'],
  description: 'View your card with full detail · N mycardinfo <name>',

  async execute(message, args) {
    const user = checkRegistered(message);
    if (!user) return;

    if (!args.length) {
      return message.reply({ embeds: [errorEmbed('Usage: `N mci <character name>`')] });
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
          `You don't own a card matching \`${args.join(' ')}\`.\n` +
          `Use \`N cards\` to browse your collection.`
        )],
      });
    }

    // Resolve all active passive bonuses from owned cards
    const passiveBonuses = resolvePassiveBonuses(userId);

    return message.reply({ embeds: [buildMyCardInfoEmbed(card, passiveBonuses)] });
  },
};
