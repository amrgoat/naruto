// ─────────────────────────────────────────────
//  level.js  —  N level <amount> <card>
//  Spend EXP Scrolls to give a card EXP.
//  1 scroll = 500 EXP
// ─────────────────────────────────────────────

const { EmbedBuilder }   = require('discord.js');
const { q, giveExpToCard } = require('../database');
const { CHARACTERS }     = require('../data/characters');
const { COLORS, MASTERY } = require('../config');
const { checkRegistered } = require('../utils/guards');
const { errorEmbed }     = require('../utils/embeds');

const EXP_PER_SCROLL = 500;

function findCharacter(query) {
  const q_ = query.toLowerCase();
  return Object.values(CHARACTERS).find(
    c => c.name.toLowerCase() === q_ || c.name.toLowerCase().startsWith(q_)
  );
}

module.exports = {
  name: 'level',
  description: 'Use EXP Scrolls to level up a card · N level <amount> <card>',

  async execute(message, args) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // ── Show usage if no args ──────────────────
    if (!args.length) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setDescription('`n level <amount> <card>`')],
      });
    }

    // ── Parse amount ───────────────────────────
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 1000) {
      return message.reply({
        embeds: [errorEmbed('Amount must be between **1** and **1,000** scrolls.')],
      });
    }

    // ── Parse card name ────────────────────────
    const cardName = args.slice(1).join(' ').trim();
    if (!cardName) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setDescription('`n level <amount> <card>`')],
      });
    }

    const char = findCharacter(cardName);
    if (!char) {
      return message.reply({
        embeds: [errorEmbed(`No character found matching **"${cardName}"**.`)],
      });
    }

    // ── Check user owns this card ──────────────
    const card = q.getCardByCharacter.get(userId, char.id);
    if (!card) {
      return message.reply({
        embeds: [errorEmbed(`You don't own **${char.name}**'s card yet.`)],
      });
    }

    // ── Check level cap ────────────────────────
    const levelCap = MASTERY[card.mastery]?.levelCap ?? 100;
    if (card.level >= levelCap) {
      return message.reply({
        embeds: [errorEmbed(
          `**${char.name}** is already at the level cap (**${levelCap}**) for Mastery ${card.mastery}.\n` +
          `Upgrade mastery to raise the cap.`
        )],
      });
    }

    // ── Check scroll balance ───────────────────
    if ((user.exp_scrolls ?? 0) < amount) {
      return message.reply({
        embeds: [errorEmbed(
          `Not enough EXP Scrolls.\n` +
          `Need **${amount}** — you have **${user.exp_scrolls ?? 0}**.`
        )],
      });
    }

    // ── Apply scrolls ──────────────────────────
    const totalExp   = amount * EXP_PER_SCROLL;
    q.addExpScrolls.run(-amount, userId);
    const updatedCard = giveExpToCard(card.id, totalExp, MASTERY);

    const levelsGained = updatedCard.level - card.level;
    const atCap        = updatedCard.level >= (MASTERY[updatedCard.mastery]?.levelCap ?? 100);

    const lines = [
      `📈 **${char.name}** gained **${totalExp.toLocaleString()} EXP** (${amount} scroll${amount !== 1 ? 's' : ''})`,
      `Level: **${card.level}** → **${updatedCard.level}**${levelsGained > 0 ? ` *(+${levelsGained})*` : ''}`,
      atCap ? `⚠️ Level cap reached (**${updatedCard.level}**). Upgrade mastery to continue.` : '',
    ].filter(Boolean);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setDescription(lines.join('\n'))],
    });
  },
};
