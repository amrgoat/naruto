// ─────────────────────────────────────────────
//  mastery.js  —  N mastery <card>
//  Upgrade a card's Mastery tier to unlock higher level caps.
//
//  M1 (cap 100) → 15 frags → M2 (cap 200) → 25 frags → M3 (cap 250)
//  M3 is the maximum Mastery for the launch version.
// ─────────────────────────────────────────────

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }          = require('../database');
const { CHARACTERS } = require('../data/characters');
const { COLORS, E, MASTERY, MASTERY_UPGRADE_COST } = require('../config');
const { checkRegistered }  = require('../utils/guards');
const { getEffectiveStats, starsDisplay, rarityBadge, formatAtk } = require('../utils/cardUtils');
const { errorEmbed }       = require('../utils/embeds');

/** Find a user's card by character name substring */
function findCard(userId, query) {
  const lq = query.toLowerCase();
  return q.getUserCards.all(userId).find(c => {
    const char = CHARACTERS[c.character_id];
    return (
      char?.name.toLowerCase().includes(lq) ||
      c.character_id.toLowerCase().replace(/_/g, ' ').includes(lq)
    );
  });
}

module.exports = {
  name: 'mastery',
  description: 'Upgrade a card\'s Mastery · N mastery <card name>',

  async execute(message, args) {
    const user = checkRegistered(message);
    if (!user) return;

    if (!args.length) return message.reply({ embeds: [errorEmbed('Usage: `N mastery <card name>`')] });

    const userId = message.author.id;
    const query  = args.join(' ');
    const card   = findCard(userId, query);

    if (!card) {
      return message.reply({ embeds: [errorEmbed(`No card found matching \`${query}\`.\nUse \`N cards\` to see your collection.`)] });
    }

    const char    = CHARACTERS[card.character_id];
    const current = card.mastery;

    // ── Already at max Mastery ────────────────
    if (current >= 3) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.mastery)
          .setTitle(`${E.mastery} Max Mastery`)
          .setDescription(
            `**${char.name}** has already reached **M3** — the highest Mastery tier.\n\n` +
            `At Lv.250 M3 you can use \`N prestige ${char.name}\` to earn Stars.`
          )
          .setImage(char.image)],
      });
    }

    const cap    = MASTERY[current].levelCap;
    const next   = current + 1;
    const cost   = MASTERY_UPGRADE_COST[next];
    const newCap = MASTERY[next].levelCap;

    // ── Not at level cap ──────────────────────
    if (card.level < cap) {
      return message.reply({
        embeds: [errorEmbed(
          `**${char.name}** must reach **Level ${cap}** to advance to M${next}.\n` +
          `Current Level: **${card.level}** / **${cap}**`
        )],
      });
    }

    // ── Not enough fragments ──────────────────
    if (card.fragments < cost) {
      return message.reply({
        embeds: [errorEmbed(
          `M${next} requires **${cost} ${E.fragment} Fragments**.\n` +
          `**${char.name}** has: **${card.fragments}** fragment${card.fragments !== 1 ? 's' : ''}\n\n` +
          `Pull duplicate copies of this card to earn more fragments.`
        )],
      });
    }

    // ── Eligible — show confirm ───────────────
    const stats = getEffectiveStats(card);
    const stars = starsDisplay(card.stars);

    const previewEmbed = new EmbedBuilder()
      .setColor(COLORS.mastery)
      .setTitle(`${E.mastery} Mastery Upgrade — M${current} → M${next}`)
      .setDescription(
        `${rarityBadge(char.rarity)} **${char.name}**${stars ? `  ${stars}` : ''}\n\n` +
        `Level cap will increase from **${cap}** → **${newCap}**.\n` +
        `Cost: **${cost} ${E.fragment} Fragments** (you have ${card.fragments})`
      )
      .addFields(
        { name: `${E.attack} ATK`,    value: `${formatAtk(stats.atkMin, stats.atkMax)}`, inline: true },
        { name: `${E.health} HP`,     value: `${stats.hp}`,                              inline: true },
        { name: `${E.speed} SPD`,     value: `${stats.spd}`,                            inline: true },
        { name: `${E.fragment} After`, value: `**${card.fragments - cost}** frags left`, inline: true },
      )
      .setImage(char.image);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`mastery_confirm_${card.id}`)
        .setLabel(`Upgrade to M${next}`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`mastery_cancel_${card.id}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

    const reply = await message.reply({ embeds: [previewEmbed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time:   30_000,
      max:    1,
    });

    collector.on('collect', async interaction => {
      if (interaction.customId === `mastery_cancel_${card.id}`) {
        return interaction.update({
          embeds: [new EmbedBuilder().setColor(COLORS.info).setDescription('Mastery upgrade cancelled.')],
          components: [],
        });
      }

      // Re-verify conditions in case of cheating / double-click
      const fresh = q.getCard.get(card.id);
      if (!fresh || fresh.level < cap) {
        return interaction.update({ embeds: [errorEmbed('Conditions no longer met.')], components: [] });
      }
      if (fresh.fragments < cost) {
        return interaction.update({ embeds: [errorEmbed('Not enough fragments.')], components: [] });
      }
      if (fresh.mastery !== current) {
        return interaction.update({ embeds: [errorEmbed('Mastery already changed.')], components: [] });
      }

      q.upgradeMastery.run(cost, card.id);
      const updated = q.getCard.get(card.id);

      return interaction.update({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.mastery)
          .setTitle(`${E.mastery} Mastery Upgraded!`)
          .setDescription(
            `**${char.name}** advanced to **M${next}**!\n\n` +
            `New level cap: **${newCap}**\n` +
            `Fragments remaining: **${updated.fragments}**`
          )
          .setImage(char.image)],
        components: [],
      });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') reply.edit({ components: [] }).catch(() => {});
    });
  },
};
