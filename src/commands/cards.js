// ─────────────────────────────────────────────
//  cards.js  —  N cards
//  Browse your collection — each card displayed
//  exactly like the pull embed, with ◀ ▶ buttons.
// ─────────────────────────────────────────────

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }              = require('../database');
const { CHARACTERS }     = require('../data/characters');
const { checkRegistered } = require('../utils/guards');
const { buildPullEmbed, errorEmbed } = require('../utils/embeds');
const { rarityBadge }    = require('../utils/cardUtils');

// Sort order: rarity then ID
const RARITY_ORDER = { C: 0, B: 1, A: 2, S: 3, SS: 4, UR: 5 };

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const ra = RARITY_ORDER[CHARACTERS[a.character_id]?.rarity ?? 'C'];
    const rb = RARITY_ORDER[CHARACTERS[b.character_id]?.rarity ?? 'C'];
    if (ra !== rb) return ra - rb;
    return a.id - b.id;
  });
}

function buildNavRow(page, total) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('cards_prev')
      .setLabel('◀')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('cards_next')
      .setLabel('▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= total - 1),
  );
}

module.exports = {
  name: 'cards',
  description: 'Browse your card collection.',

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    const rawCards = q.getUserCards.all(userId);
    if (!rawCards.length) {
      return message.reply({
        embeds: [errorEmbed(`You don't own any cards yet.\nUse \`N pull\` to summon your first ninja!`)],
      });
    }

    const cards      = sortCards(rawCards);
    const memberName = message.member?.displayName ?? message.author.username;
    let   page       = 0;

    const buildPage = (idx) => {
      const card = cards[idx];
      const char = CHARACTERS[card.character_id];

      // Reuse the pull embed style, then replace the footer with page info
      const embed = buildPullEmbed(card, false, memberName, card.fragments);
      embed.setFooter({
        text: `Card ${idx + 1} of ${cards.length}  ·  ${rarityBadge(char.rarity)} ${char.name}`,
      });
      return embed;
    };

    const reply = await message.reply({
      embeds:     [buildPage(0)],
      components: [buildNavRow(0, cards.length)],
    });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time:   300_000, // 5 minutes
    });

    collector.on('collect', async i => {
      if (i.customId === 'cards_prev') page = Math.max(0, page - 1);
      else                             page = Math.min(cards.length - 1, page + 1);

      await i.update({
        embeds:     [buildPage(page)],
        components: [buildNavRow(page, cards.length)],
      });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
