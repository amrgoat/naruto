// ─────────────────────────────────────────────
//  lab.js  —  N lab
//  Orochimaru's Laboratory: craft fragments using
//  Chakra Essence. Requires owning Orochimaru.
//
//  M1: Craft D–A rank fragments
//  M2: + S rank fragments
//  M3: + 20% discount  · duplicates → essence
// ─────────────────────────────────────────────

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { q }                      = require('../database');
const { CHARACTERS }             = require('../data/characters');
const { COLORS, RARITIES }       = require('../config');
const { checkRegistered }        = require('../utils/guards');
const { resolvePassiveBonuses }  = require('../utils/passives');
const { errorEmbed, successEmbed } = require('../utils/embeds');

// ── Costs & Essence per duplicate ─────────────
const LAB_COSTS      = { D: 30, C: 50, B: 90, A: 150, S: 250 };
const ESSENCE_PER_DUP = { D: 20, C: 30, B: 50, A: 90, S: 150 };

module.exports = {
  name: 'lab',
  description: "Orochimaru's Laboratory — craft fragments · N lab",

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // ── Orochimaru passive check ───────────────
    const pb = resolvePassiveBonuses(userId);
    if (!pb.unlockLab) {
      return message.reply({
        embeds: [errorEmbed(
          'The Laboratory is locked.\nObtain **Orochimaru** to unlock it.'
        )],
      });
    }

    const discount  = pb.labDiscount;   // 0 or 0.20
    const canCraftS = pb.labSRank;

    // Ranks available for crafting
    const availableRanks = canCraftS
      ? ['D', 'C', 'B', 'A', 'S']
      : ['D', 'C', 'B', 'A'];

    // ── Step 1: Rank select ────────────────────
    const labEmbed = new EmbedBuilder()
      .setColor(COLORS.mastery)
      .setTitle('\u{1F9EA} Orochimaru\'s Laboratory')
      .setDescription(
        `Choose a rank to craft a **Fragment**.\n\n` +
        availableRanks.map(r => {
          const base = LAB_COSTS[r];
          const cost = Math.floor(base * (1 - discount));
          return `**${r} Rank** — ${cost} Chakra Essence${discount > 0 ? ` ~~${base}~~` : ''}`;
        }).join('\n') +
        `\n\n> Your Essence: **${user.chakra_essence.toLocaleString()}**` +
        (discount > 0 ? `\n> M3 discount: **-20%**` : '')
      );

    const rankMenu = new StringSelectMenuBuilder()
      .setCustomId('lab_rank')
      .setPlaceholder('Select rank to craft...')
      .addOptions(
        availableRanks.map(r => {
          const cost = Math.floor(LAB_COSTS[r] * (1 - discount));
          return new StringSelectMenuOptionBuilder()
            .setLabel(`${r} Rank  —  ${cost} Essence`)
            .setValue(r);
        })
      );

    const reply = await message.reply({
      embeds:     [labEmbed],
      components: [new ActionRowBuilder().addComponents(rankMenu)],
    });

    // ── Rank collector ─────────────────────────
    const rankCollector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId && i.customId === 'lab_rank',
      time:   60_000,
      max:    1,
    });

    rankCollector.on('collect', async rankInteraction => {
      const rank = rankInteraction.values[0];
      const cost = Math.floor(LAB_COSTS[rank] * (1 - discount));

      // Get user's owned characters of this rank
      const ownedCards = q.getUserCards.all(userId).filter(c => {
        const ch = CHARACTERS[c.character_id];
        return ch?.rarity === rank;
      });

      if (!ownedCards.length) {
        return rankInteraction.update({
          embeds: [errorEmbed(
            `You don't own any **${rank} Rank** cards to craft fragments for.\n` +
            `Pull more cards and try again.`
          )],
          components: [],
        });
      }

      // ── Step 2: Character select ─────────────
      const charOptions = ownedCards.slice(0, 25).map(c => {
        const ch = CHARACTERS[c.character_id];
        return new StringSelectMenuOptionBuilder()
          .setLabel(ch.name)
          .setDescription(`Fragments: ${c.fragments}  ·  M${c.mastery} Lv.${c.level}`)
          .setValue(String(c.id));
      });

      const charMenu = new StringSelectMenuBuilder()
        .setCustomId('lab_char')
        .setPlaceholder(`Select a ${rank} Rank card...`)
        .addOptions(charOptions);

      await rankInteraction.update({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.mastery)
          .setTitle(`\u{1F9EA} Craft ${rank} Rank Fragment`)
          .setDescription(
            `Cost: **${cost} Chakra Essence**\n` +
            `Your Essence: **${q.getUser.get(userId).chakra_essence.toLocaleString()}**\n\n` +
            `Select which **${rank} Rank** card gets the fragment:`
          )],
        components: [new ActionRowBuilder().addComponents(charMenu)],
      });

      // ── Char collector ───────────────────────
      const charCollector = reply.createMessageComponentCollector({
        filter: i => i.user.id === userId && i.customId === 'lab_char',
        time:   60_000,
        max:    1,
      });

      charCollector.on('collect', async charInteraction => {
        const cardId   = parseInt(charInteraction.values[0], 10);
        const freshUser = q.getUser.get(userId);
        const targetCard = q.getCard.get(cardId);

        if (!targetCard) {
          return charInteraction.update({ embeds: [errorEmbed('Card not found.')], components: [] });
        }

        // ── Confirm button ───────────────────────
        const char = CHARACTERS[targetCard.character_id];
        const currentEssence = freshUser.chakra_essence;

        if (currentEssence < cost) {
          return charInteraction.update({
            embeds: [errorEmbed(
              `Not enough Chakra Essence.\n` +
              `Need **${cost}**, you have **${currentEssence}**.`
            )],
            components: [],
          });
        }

        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('lab_confirm')
            .setLabel(`Craft — ${cost} Essence`)
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('lab_cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary),
        );

        await charInteraction.update({
          embeds: [new EmbedBuilder()
            .setColor(COLORS.mastery)
            .setTitle('\u{1F9EA} Confirm Crafting')
            .setDescription(
              `Craft **1x ${char.name} Fragment** for **${cost} Chakra Essence**?\n\n` +
              `Your Essence: **${currentEssence.toLocaleString()}**\n` +
              `After: **${(currentEssence - cost).toLocaleString()}**`
            )],
          components: [confirmRow],
        });

        // ── Confirm collector ────────────────────
        const confirmCollector = reply.createMessageComponentCollector({
          filter: i => i.user.id === userId && (i.customId === 'lab_confirm' || i.customId === 'lab_cancel'),
          time:   30_000,
          max:    1,
        });

        confirmCollector.on('collect', async confirmInteraction => {
          if (confirmInteraction.customId === 'lab_cancel') {
            return confirmInteraction.update({
              embeds: [new EmbedBuilder().setColor(COLORS.info).setDescription('Crafting cancelled.')],
              components: [],
            });
          }

          // Re-check essence
          const latestUser = q.getUser.get(userId);
          if (latestUser.chakra_essence < cost) {
            return confirmInteraction.update({
              embeds: [errorEmbed('Not enough Chakra Essence.')],
              components: [],
            });
          }

          // Deduct and give fragment
          q.addChakraEssence.run(-cost, userId);
          q.addFragment.run(cardId);

          const updatedCard = q.getCard.get(cardId);
          const updatedUser = q.getUser.get(userId);

          return confirmInteraction.update({
            embeds: [successEmbed(
              `\u{1F9EA} Crafted **1x ${char.name} Fragment**!\n\n` +
              `${char.name} Fragments: **${updatedCard.fragments}**\n` +
              `Chakra Essence remaining: **${updatedUser.chakra_essence.toLocaleString()}**`
            )],
            components: [],
          });
        });

        confirmCollector.on('end', (_, reason) => {
          if (reason === 'time') reply.edit({ components: [] }).catch(() => {});
        });
      });

      charCollector.on('end', (_, reason) => {
        if (reason === 'time') reply.edit({ components: [] }).catch(() => {});
      });
    });

    rankCollector.on('end', (_, reason) => {
      if (reason === 'time') reply.edit({ components: [] }).catch(() => {});
    });
  },
};

module.exports.LAB_COSTS       = LAB_COSTS;
module.exports.ESSENCE_PER_DUP = ESSENCE_PER_DUP;
