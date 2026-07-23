// ─────────────────────────────────────────────
//  prestige.js  —  N prestige <card>
//  Earn a Star for a card (max 5 stars).
//  Requires: Level 250 + M3.
//  Resets card to Level 1, Mastery 1.
//  Each Star gives +20% ATK, HP, SPD (additive).
// ─────────────────────────────────────────────

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { q }          = require('../database');
const { CHARACTERS } = require('../data/characters');
const { COLORS, E, MAX_STARS, PRESTIGE_COSTS, PRESTIGE_STAT_BONUS } = require('../config');
const { checkRegistered }  = require('../utils/guards');
const { getEffectiveStats, starsDisplay, rarityBadge, formatAtk } = require('../utils/cardUtils');
const { errorEmbed }       = require('../utils/embeds');

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
  name: 'prestige',
  description: 'Earn a Star for a card · requires Level 250 + M3',

  async execute(message, args) {
    const user = checkRegistered(message);
    if (!user) return;

    if (!args.length) return message.reply({ embeds: [errorEmbed('Usage: `N prestige <card name>`')] });

    const userId = message.author.id;
    const query  = args.join(' ');
    const card   = findCard(userId, query);

    if (!card) {
      return message.reply({ embeds: [errorEmbed(`No card found matching \`${query}\`.\nUse \`N cards\` to see your collection.`)] });
    }

    const char = CHARACTERS[card.character_id];

    // ── Requirement: M3 ───────────────────────
    if (card.mastery < 3) {
      return message.reply({
        embeds: [errorEmbed(
          `**${char.name}** must be **M3** to Prestige.\n` +
          `Current Mastery: **M${card.mastery}**\n\n` +
          `Use \`N mastery ${char.name}\` to advance.`
        )],
      });
    }

    // ── Requirement: Level 250 ────────────────
    if (card.level < 250) {
      return message.reply({
        embeds: [errorEmbed(
          `**${char.name}** must be **Level 250** to Prestige.\n` +
          `Current Level: **${card.level}** / 250`
        )],
      });
    }

    // ── Already max stars ─────────────────────
    if (card.stars >= MAX_STARS) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle(`${E.prestige} Max Stars Reached!`)
          .setDescription(
            `**${char.name}** already has **${starsDisplay(MAX_STARS)}** — the maximum!\n\n` +
            `Total bonus: **+${MAX_STARS * 100 * PRESTIGE_STAT_BONUS}%** to all stats.`
          )
          .setImage(char.image)],
      });
    }

    // ── Fragment cost ─────────────────────────
    const nextStar = card.stars + 1;
    const cost     = PRESTIGE_COSTS[nextStar];

    if (card.fragments < cost) {
      const costList = Object.entries(PRESTIGE_COSTS).map(([s, c]) => {
        const n = Number(s);
        const icon = n < nextStar ? '✅' : n === nextStar ? '▶' : '  ';
        return `${icon} ⭐${s} — **${c} Fragments**`;
      }).join('\n');

      return message.reply({
        embeds: [errorEmbed(
          `⭐${nextStar} requires **${cost} ${E.fragment} Fragments**.\n` +
          `**${char.name}** has: **${card.fragments}**\n\n` +
          `**Star costs:**\n${costList}`
        )],
      });
    }

    // ── Eligible — show confirm ───────────────
    const stats = getEffectiveStats(card);
    const currentBonus = `+${(card.stars * PRESTIGE_STAT_BONUS * 100).toFixed(0)}%`;
    const newBonus     = `+${(nextStar   * PRESTIGE_STAT_BONUS * 100).toFixed(0)}%`;

    const previewEmbed = new EmbedBuilder()
      .setColor(COLORS.EMBED_COLOR)
      .setTitle(`${E.prestige} Prestige — ⭐${nextStar}`)
      .setDescription([
        `${rarityBadge(char.rarity)} **${char.name}**`,
        ``,
        `⚠️ **This will reset the card to Level 1, Mastery 1.**`,
        ``,
        `Stars: ${starsDisplay(card.stars) || 'None'} → **${starsDisplay(nextStar)}**`,
        `Stat bonus: ${currentBonus} → **${newBonus}** to all stats`,
        `Cost: **${cost} ${E.fragment} Fragments** (you have ${card.fragments})`,
      ].join('\n'))
      .addFields(
        { name: `${E.attack} Current ATK`, value: formatAtk(stats.atkMin, stats.atkMax), inline: true },
        { name: `${E.health} Current HP`,  value: `${stats.hp}`,                         inline: true },
        { name: '\u200B',                  value: '\u200B',                               inline: true },
        { name: `${E.fragment} Frags Left`, value: `**${card.fragments - cost}**`,       inline: true },
      )
      .setImage(char.image);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`prestige_confirm_${card.id}`)
        .setLabel(`Prestige to ⭐${nextStar}`)
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`prestige_cancel_${card.id}`)
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
      if (interaction.customId === `prestige_cancel_${card.id}`) {
        return interaction.update({
          embeds: [new EmbedBuilder().setColor(COLORS.EMBED_COLOR).setDescription('Prestige cancelled.')],
          components: [],
        });
      }

      // Re-verify
      const fresh = q.getCard.get(card.id);
      if (!fresh || fresh.mastery < 3 || fresh.level < 250 || fresh.stars >= MAX_STARS) {
        return interaction.update({ embeds: [errorEmbed('Conditions no longer met.')], components: [] });
      }
      if (fresh.fragments < cost) {
        return interaction.update({ embeds: [errorEmbed('Not enough fragments.')], components: [] });
      }

      q.prestige.run(cost, card.id);
      const updated = q.getCard.get(card.id);

      // Calculate new stats at Lv.1 M1 with new star count
      const newStats = getEffectiveStats(updated);

      return interaction.update({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle(`${E.prestige} Prestige Successful — ${starsDisplay(nextStar)}`)
          .setDescription(
            `**${char.name}** is now **${starsDisplay(nextStar)}**!\n\n` +
            `Card reset to **Level 1, Mastery 1**.\n` +
            `Stat bonus: **+${(nextStar * PRESTIGE_STAT_BONUS * 100).toFixed(0)}%** to all stats.`
          )
          .addFields(
            { name: `${E.attack} New ATK`, value: `**${formatAtk(newStats.atkMin, newStats.atkMax)}**`, inline: true },
            { name: `${E.health} New HP`,  value: `**${newStats.hp}**`,                                 inline: true },
            { name: `${E.speed} New SPD`,  value: `**${newStats.spd}**`,                               inline: true },
            { name: `${E.fragment} Frags`, value: `**${updated.fragments}**`,                           inline: true },
            { name: `Next Star`,           value: nextStar < MAX_STARS ? `⭐${nextStar + 1} — **${PRESTIGE_COSTS[nextStar + 1]} frags** at Lv.250 M3` : '*Max stars reached!*', inline: false },
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
