// ─────────────────────────────────────────────
//  ci.js  —  N ci <name>  (Card Info)
//  Layout matches the reference design:
//  · Description = lore line
//  · Inline bold stats
//  · Effect = passive at current mastery
//  · Previous Mastery / Next Mastery buttons
//  · Footer: "CharName Card Mastery m/3"
// ─────────────────────────────────────────────

const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { CHARACTERS }                            = require('../data/characters');
const { RARITIES, MASTERY }                     = require('../config');
const { PASSIVES }                              = require('../utils/passives');
const { getStatsAtMastery, formatAtk, rarityColor } = require('../utils/cardUtils');
const { rarityThumb, errorEmbed }               = require('../utils/embeds');

// ── Embed builder ─────────────────────────────

function buildCiEmbed(char, m) {
  const passive  = PASSIVES[char.id];
  const stats    = getStatsAtMastery(char.id, m);
  const levelCap = MASTERY[m]?.levelCap ?? 100;

  const sourceText = char.pullLocked
    ? 'Special Obtain'
    : 'Card Pulls';

  const effectText = passive
    ? passive.describe(m)
    : 'None';

  // Stats block: each field on its own line
  const statsLines = [];

  // Support cards don't have combat stats
  if (char.type !== 'Support') {
    statsLines.push(`**Power:** ${formatAtk(stats.atkMin, stats.atkMax)}`);
    statsLines.push(`**Health:** ${stats.hp.toLocaleString()}`);
    statsLines.push(`**Speed:** ${stats.spd}`);
    statsLines.push(`**Level Cap:** ${levelCap}`);
  }

  statsLines.push(`**Type:** ${char.type}`);
  statsLines.push(`**Effect:** ${effectText}`);
  statsLines.push(`**Source:** ${sourceText}`);

  // Description = lore line, then blank line, then stats
  const desc = `${char.description}\n\n${statsLines.join('\n')}`;

  return new EmbedBuilder()
    .setColor(rarityColor(char.rarity))
    .setTitle(char.name)
    .setThumbnail(rarityThumb(char.rarity))
    .setDescription(desc)
    .setImage(char.image)
    .setFooter({
      text:    `${char.name} Card Mastery ${m}/3`,
      iconURL: rarityThumb(char.rarity),
    });
}

// ── Button row ────────────────────────────────

function buildMasteryRow(m) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ci_prev')
      .setLabel('Previous Mastery')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(m <= 1),
    new ButtonBuilder()
      .setCustomId('ci_next')
      .setLabel('Next Mastery')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(m >= 3),
  );
}

// ── Command ───────────────────────────────────

module.exports = {
  name: 'ci',
  description: 'Look up any character · N ci <name>',

  async execute(message, args) {
    if (!args.length) {
      return message.reply({ embeds: [errorEmbed('Usage: `N ci <character name>`')] });
    }

    const query = args.join(' ').toLowerCase();
    const char  = Object.values(CHARACTERS).find(c =>
      c.name.toLowerCase().includes(query) ||
      c.id.toLowerCase().replace(/_/g, ' ').includes(query)
    );

    if (!char) {
      return message.reply({
        embeds: [errorEmbed(
          `No character found matching \`${args.join(' ')}\`.\nUse \`N all\` to browse the full roster.`
        )],
      });
    }

    let m = 1;

    const reply = await message.reply({
      embeds:     [buildCiEmbed(char, m)],
      components: [buildMasteryRow(m)],
    });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id && (i.customId === 'ci_prev' || i.customId === 'ci_next'),
      time:   300_000,
    });

    collector.on('collect', async i => {
      m = i.customId === 'ci_next' ? Math.min(m + 1, 3) : Math.max(m - 1, 1);
      await i.update({
        embeds:     [buildCiEmbed(char, m)],
        components: [buildMasteryRow(m)],
      });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  },
};
