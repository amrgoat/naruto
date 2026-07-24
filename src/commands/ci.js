// ─────────────────────────────────────────────
//  ci.js  —  N ci <name>  (Card Info)
//  · Description = lore line
//  · Plain text stat labels (ATK HP SPD — no custom emojis)
//  · Effect = passive at current mastery
//  · [M1] [M2] [M3] buttons — highlights active, edits same embed
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

  // Stats block — plain text only, no custom emojis
  const statsLines = [];

  if (char.type !== 'Support') {
    statsLines.push(`**ATK:** ${formatAtk(stats.atkMin, stats.atkMax)}`);
    statsLines.push(`**HP:** ${stats.hp.toLocaleString()}`);
    statsLines.push(`**SPD:** ${stats.spd}`);
    statsLines.push(`**Level Cap:** ${levelCap}`);
  }

  statsLines.push(`**Type:** ${char.type}`);
  statsLines.push(`**Passive:** ${effectText}`);
  statsLines.push(`**Source:** ${sourceText}`);

  const desc = `${char.description}\n\n${statsLines.join('\n')}`;

  return new EmbedBuilder()
    .setColor(rarityColor(char.rarity))
    .setTitle(char.name)
    .setThumbnail(rarityThumb(char.rarity))
    .setDescription(desc)
    .setImage(char.image)
    .setFooter({
      text:    `${char.name} Card  ·  Mastery ${m}/3`,
      iconURL: rarityThumb(char.rarity),
    });
}

// ── Button row — [M1] [M2] [M3] ──────────────

function buildMasteryRow(m) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ci_m1')
      .setLabel('M1')
      .setStyle(m === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ci_m2')
      .setLabel('M2')
      .setStyle(m === 2 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ci_m3')
      .setLabel('M3')
      .setStyle(m === 3 ? ButtonStyle.Primary : ButtonStyle.Secondary),
  );
}

// ── Command ───────────────────────────────────

module.exports = {
  name: 'cardinfo',
  aliases: ['ci'],
  description: 'Look up any character · N cardinfo <name>',

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
      filter: i =>
        i.user.id === message.author.id &&
        ['ci_m1', 'ci_m2', 'ci_m3'].includes(i.customId),
      time: 300_000,
    });

    collector.on('collect', async i => {
      if (i.customId === 'ci_m1') m = 1;
      else if (i.customId === 'ci_m2') m = 2;
      else if (i.customId === 'ci_m3') m = 3;

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
