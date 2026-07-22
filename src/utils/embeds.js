// ─────────────────────────────────────────────
//  embeds.js  —  Reusable Discord embed builders
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS, E, MASTERY, RARITIES } = require('../config');
const { CHARACTERS }                   = require('../data/characters');
const {
  getEffectiveStats, formatAtk, starsDisplay, rarityColor, expBar,
} = require('./cardUtils');

// ── Shared helpers ────────────────────────────

/** Convert integer colour (0xRRGGBB) → 6-char hex string for URLs */
function toHex(int) {
  return int.toString(16).toUpperCase().padStart(6, '0');
}

/** Rarity badge thumbnail URL (provided per-rarity in config) */
function rarityThumb(rarityKey) {
  const r = RARITIES[rarityKey] ?? RARITIES.D;
  return r.thumb ?? null;
}

// ─────────────────────────────────────────────
//  Pull / N cards
// ─────────────────────────────────────────────

/**
 * Pull embed — N pull and N cards pagination.
 *   description = char description, then stars only if > 0, then stats
 */
function buildPullEmbed(card, isDuplicate, pullerName, fragCount) {
  const char  = CHARACTERS[card.character_id];
  const stats = getEffectiveStats(card);
  const stars = starsDisplay(card.stars);

  const lines = [char.description];
  if (card.stars > 0) lines.push(stars);
  lines.push(
    '',
    `**ATK:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**HP:** ${stats.hp.toLocaleString()}`,
    `**SPD:** ${stats.spd}`,
    `**Type:** ${char.type}`,
    `**Source:** Card Pulls`,
  );

  const footerText = `This card was pulled by ${pullerName}`;

  return new EmbedBuilder()
    .setColor(rarityColor(char.rarity))
    .setTitle(char.name)
    .setThumbnail(rarityThumb(char.rarity))
    .setDescription(lines.join('\n'))
    .setImage(char.image)
    .setFooter({ text: footerText });
}

// ─────────────────────────────────────────────
//  N card — simple owned-card view
// ─────────────────────────────────────────────

function buildCardEmbed(card) {
  const char  = CHARACTERS[card.character_id];
  const stats = getEffectiveStats(card);
  const stars = starsDisplay(card.stars);
  const cap   = MASTERY[card.mastery]?.levelCap ?? 100;
  const atCap = card.level >= cap;

  const lines = [char.description];
  if (card.stars > 0) lines.push(stars);
  lines.push(
    `Level **${card.level}** / ${cap}  ·  Mastery **${card.mastery}**`,
    atCap ? '*Level cap reached*' : expBar(card),
    '',
    `**ATK:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**HP:** ${stats.hp.toLocaleString()}`,
    `**SPD:** ${stats.spd}`,
    `**Type:** ${char.type}`,
    `**Fragments:** ${card.fragments}`,
  );

  return new EmbedBuilder()
    .setColor(rarityColor(char.rarity))
    .setTitle(char.name)
    .setThumbnail(rarityThumb(char.rarity))
    .setDescription(lines.join('\n'))
    .setImage(char.image)
    .setFooter({ text: `${char.name}  ·  ${RARITIES[char.rarity]?.label ?? char.rarity}` });
}

// ─────────────────────────────────────────────
//  N mci — full owned-card view with boost support
//  boosts = { power, health, speed } (all optional)
// ─────────────────────────────────────────────

/**
 * N mci — owned card with fully resolved passive bonuses.
 * passiveBonuses = { hpPct, flatSpd } from resolvePassiveBonuses().
 * Uses plain text labels (ATK / HP / SPD) — no custom emojis.
 */
function buildMyCardInfoEmbed(card, passiveBonuses = {}) {
  const char  = CHARACTERS[card.character_id];
  const stats = getEffectiveStats(card, passiveBonuses);
  const stars = starsDisplay(card.stars);
  const cap   = MASTERY[card.mastery]?.levelCap ?? 100;
  const atCap = card.level >= cap;

  const { hpPct = 0, flatSpd = 0 } = passiveBonuses;

  const lines = [char.description];
  if (card.stars > 0) lines.push(stars);
  lines.push(
    `Level **${card.level}** / ${cap}  ·  Mastery **${card.mastery}**`,
    atCap ? '*Level cap reached*' : expBar(card),
    '',
    `**ATK:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**HP:** ${stats.hp.toLocaleString()}`,
    `**SPD:** ${stats.spd}`,
    `**Type:** ${char.type}`,
    `**Fragments:** ${card.fragments}`,
  );

  // Show active passive stat bonuses
  const activeBoosts = [];
  if (hpPct > 0)   activeBoosts.push(`+${Math.round(hpPct * 100)}% HP (Choji)`);
  if (flatSpd > 0)  activeBoosts.push(`+${flatSpd} Speed (Rock Lee)`);
  if (activeBoosts.length) {
    lines.push('', `✦ **Passives Active:** ${activeBoosts.join('  ·  ')}`);
  }

  return new EmbedBuilder()
    .setColor(rarityColor(char.rarity))
    .setTitle(char.name)
    .setThumbnail(rarityThumb(char.rarity))
    .setDescription(lines.join('\n'))
    .setImage(char.image)
    .setFooter({ text: `${char.name}  ·  ${RARITIES[char.rarity]?.label ?? char.rarity}` });
}

// ─────────────────────────────────────────────
//  N ci / N all — roster (no owned card)
// ─────────────────────────────────────────────

function buildRosterEmbed(char, footerText) {
  const stats  = getEffectiveStats({
    character_id: char.id, level: 1, mastery: 1, stars: 0, fragments: 0, exp: 0,
  });
  const locked = RARITIES[char.rarity]?.locked ?? false;

  const lines = [char.description];
  if (locked) lines.push(`${E.locked} *Cannot be pulled*`);
  lines.push(
    '',
    `**ATK:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**HP:** ${stats.hp.toLocaleString()}`,
    `**SPD:** ${stats.spd}`,
    `**Type:** ${char.type}`,
    `**Source:** ${locked ? 'Locked' : 'Card Pulls'}`,
  );

  return new EmbedBuilder()
    .setColor(rarityColor(char.rarity))
    .setTitle(char.name)
    .setThumbnail(rarityThumb(char.rarity))
    .setDescription(lines.join('\n'))
    .setImage(char.image)
    .setFooter({ text: footerText });
}

// ─────────────────────────────────────────────
//  Generic helpers
// ─────────────────────────────────────────────

function errorEmbed(description) {
  return new EmbedBuilder().setColor(COLORS.error).setDescription(`${description}`);
}

function successEmbed(description) {
  return new EmbedBuilder().setColor(COLORS.success).setDescription(`${description}`);
}

function infoEmbed(description) {
  return new EmbedBuilder().setColor(COLORS.info).setDescription(`${description}`);
}

module.exports = {
  buildPullEmbed,
  buildCardEmbed,
  buildMyCardInfoEmbed,
  buildRosterEmbed,
  rarityThumb,
  errorEmbed,
  successEmbed,
  infoEmbed,
};
