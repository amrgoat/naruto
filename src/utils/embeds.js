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
    atCap
      ? `Level **${card.level}** · *Level cap reached (${cap})*`
      : `Level **${card.level}** · ${expBar(card)}`,
    `Mastery **${card.mastery}**`,
    '',
    `**Attack:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**Health:** ${stats.hp.toLocaleString()}`,
    `**Speed:** ${stats.spd}`,
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
    atCap
      ? `Level **${card.level}** · *Level cap reached (${cap})*`
      : `Level **${card.level}** · ${expBar(card)}`,
    `Mastery **${card.mastery}**`,
    '',
    `**Attack:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**Health:** ${stats.hp.toLocaleString()}`,
    `**Speed:** ${stats.spd}`,
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
//  N ci / N all — roster (no owned card)
// ─────────────────────────────────────────────

function buildRosterEmbed(char, footerText) {
  const stats  = getEffectiveStats({
    character_id: char.id, level: 0, mastery: 1, stars: 0, fragments: 0, exp: 0,
  });
  const locked = RARITIES[char.rarity]?.locked ?? false;

  const lines = [char.description];
  if (locked) lines.push(`${E.locked} *Unavailable*`);
  lines.push(
    '',
    `**Attack:** ${formatAtk(stats.atkMin, stats.atkMax)}`,
    `**Health:** ${stats.hp.toLocaleString()}`,
    `**Speed:** ${stats.spd}`,
    `**Type:** ${char.type}`,
    `**Source:** ${locked ? 'Unavailable' : 'Card Pulls'}`,
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
  return new EmbedBuilder().setColor(COLORS.EMBED_COLOR).setDescription(`${description}`);
}

function successEmbed(description) {
  return new EmbedBuilder().setColor(COLORS.EMBED_COLOR).setDescription(`${description}`);
}

function infoEmbed(description) {
  return new EmbedBuilder().setColor(COLORS.EMBED_COLOR).setDescription(`${description}`);
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
