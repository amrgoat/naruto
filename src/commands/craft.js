// ─────────────────────────────────────────────
//  craft.js  —  N craft <amount> <card>
//  Craft fragments for a card you own using
//  Chakra Essence. Requires owning Orochimaru.
//
//  M1: Craft D–A rank fragments
//  M2: + S rank fragments
//  M3: + 20% discount on all crafting costs
// ─────────────────────────────────────────────

const { EmbedBuilder }           = require('discord.js');
const { q }                      = require('../database');
const { CHARACTERS }             = require('../data/characters');
const { COLORS, RARITIES }       = require('../config');
const { checkRegistered }        = require('../utils/guards');
const { resolvePassiveBonuses }  = require('../utils/passives');
const { errorEmbed }             = require('../utils/embeds');

const CRAFT_COSTS = { D: 30, C: 50, B: 90, A: 150, S: 250 };

// Find a character by name (case-insensitive, partial match)
function findCharacter(query) {
  const q_ = query.toLowerCase();
  return Object.values(CHARACTERS).find(
    c => c.name.toLowerCase() === q_ || c.name.toLowerCase().startsWith(q_)
  );
}

module.exports = {
  name: 'craft',
  description: 'Craft card fragments · N craft <amount> <card>',

  async execute(message, args) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // ── Show usage if no args ──────────────────
    if (!args.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setDescription('`n craft <amount> <card>`')],
      });
    }

    // ── Parse amount and card name ─────────────
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 500) {
      return message.reply({
        embeds: [errorEmbed('`n craft <amount> <card>` — amount must be between 1 and 500.')],
      });
    }

    const cardName = args.slice(1).join(' ').trim();
    if (!cardName) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setDescription('`n craft <amount> <card>`')],
      });
    }

    // ── Orochimaru passive check ───────────────
    const pb = resolvePassiveBonuses(userId);
    if (!pb.unlockLab) {
      return message.reply({
        embeds: [errorEmbed('The Laboratory is locked.\nObtain **Orochimaru** to unlock it.')],
      });
    }

    // ── Find character ─────────────────────────
    const char = findCharacter(cardName);
    if (!char) {
      return message.reply({
        embeds: [errorEmbed(`No character found matching **"${cardName}"**.`)],
      });
    }

    // ── Check rarity access ────────────────────
    const canCraftS = pb.labSRank;
    if (char.rarity === 'S' && !canCraftS) {
      return message.reply({
        embeds: [errorEmbed('S-rank crafting requires **Orochimaru M2 or higher**.')],
      });
    }
    if (!CRAFT_COSTS[char.rarity]) {
      return message.reply({
        embeds: [errorEmbed(`**${char.name}** (${char.rarity}) cannot be crafted.`)],
      });
    }

    // ── Check user owns this card ──────────────
    const card = q.getCardByCharacter.get(userId, char.id);
    if (!card) {
      return message.reply({
        embeds: [errorEmbed(`You don't own **${char.name}**'s card yet.`)],
      });
    }

    // ── Calculate cost ─────────────────────────
    const baseCost  = CRAFT_COSTS[char.rarity];
    const discount  = pb.labDiscount ?? 0;
    const unitCost  = Math.floor(baseCost * (1 - discount));
    const totalCost = unitCost * amount;

    if (user.chakra_essence < totalCost) {
      return message.reply({
        embeds: [errorEmbed(
          `Not enough Chakra Essence.\n` +
          `Need **${totalCost.toLocaleString()}** — you have **${user.chakra_essence.toLocaleString()}**.`
        )],
      });
    }

    // ── Craft ──────────────────────────────────
    q.addChakraEssence.run(-totalCost, userId);
    q.addFragmentsN.run(amount, card.id);

    return message.reply({
      content: `Successfully crafted **${amount}×${char.name}**`,
      allowedMentions: { repliedUser: false },
    });
  },
};

module.exports.CRAFT_COSTS = CRAFT_COSTS;
