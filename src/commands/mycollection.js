// ─────────────────────────────────────────────
//  mycollection.js  —  n mc [rarity]
//  Browse your collection — highest rarity first.
//  Optional: N mc S  →  show only S-rank cards.
// ─────────────────────────────────────────────

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }               = require('../database');
const { CHARACTERS }      = require('../data/characters');
const { checkRegistered } = require('../utils/guards');
const { buildPullEmbed, errorEmbed } = require('../utils/embeds');
const { getEffectiveRarity, RARITY_SEQUENCE } = require('../utils/cardUtils');

const VALID_RARITIES = new Set(['D', 'C', 'B', 'A', 'S', 'SS', 'UR']);

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const charA  = CHARACTERS[a.character_id];
    const charB  = CHARACTERS[b.character_id];
    const ra = RARITY_SEQUENCE.indexOf(getEffectiveRarity(charA, a));
    const rb = RARITY_SEQUENCE.indexOf(getEffectiveRarity(charB, b));
    if (ra !== rb) return rb - ra; // highest rarity first
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
  name: 'mycollection',
  aliases: ['mc'],
  description: 'Browse your card collection. Usage: `n mc` or `n mc <rarity>`',

  async execute(message, args) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // Optional rarity filter
    const rarityArg = args[0]?.toUpperCase();
    if (rarityArg && !VALID_RARITIES.has(rarityArg)) {
      return message.reply({
        embeds: [errorEmbed(`Invalid rarity **${args[0]}**.\nValid options: \`C\`, \`B\`, \`A\`, \`S\`, \`SS\`, \`UR\``)],
      });
    }

    const rawCards = q.getUserCards.all(userId);
    if (!rawCards.length) {
      return message.reply({
        embeds: [errorEmbed(`You don't own any cards yet.\nUse \`n pull\` to summon your first ninja!`)],
      });
    }

    // Filter by effective rarity if requested
    const filtered = rarityArg
      ? rawCards.filter(c => {
          const char = CHARACTERS[c.character_id];
          return char && getEffectiveRarity(char, c) === rarityArg;
        })
      : rawCards;

    if (!filtered.length) {
      return message.reply({
        embeds: [errorEmbed(`You don't own any **${rarityArg}-Rank** cards yet.`)],
      });
    }

    const cards      = sortCards(filtered);
    const memberName = message.member?.displayName ?? message.author.username;
    let   page       = 0;

    const buildPage = (idx) => {
      const card  = cards[idx];
      const embed = buildPullEmbed(card, false, memberName, card.fragments);
      embed.setFooter({ text: `Card ${idx + 1} of ${cards.length}` });
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
