// ─────────────────────────────────────────────
//  cardUtils.js  —  Stat calculation helpers
//
//  STAT FORMULA
//  ────────────
//  inner = base × (1 + masteryMult) + (level − 1) × growth
//
//  Final ATK  = floor(inner × (1 + starPct))
//  Final HP   = floor(inner × (1 + starPct + hpPct))   ← Choji passive
//  Final SPD  = floor(inner × (1 + starPct)) + flatSpd  ← Rock Lee passive
//
//  All percentage bonuses (stars, Choji, future buffs) are summed FIRST
//  and applied once. They never multiply each other individually.
//
//  Goal: Level 250 M3 ≈ 15× the card's Level 1 M1 stats.
// ─────────────────────────────────────────────

const { CHARACTERS }                       = require('../data/characters');
const { MASTERY, PRESTIGE_STAT_BONUS, RARITIES } = require('../config');

/**
 * Compute effective stats for a card row from the database.
 *
 * @param {Object} card            — database card row
 * @param {Object} [passiveBonuses]
 * @param {number} [passiveBonuses.hpPct=0]    — additive HP % (e.g. 0.10 = +10%)
 * @param {number} [passiveBonuses.flatSpd=0]  — flat Speed added after all % boosts
 * @returns {{ atkMin, atkMax, hp, spd, critRate }} | null
 */
function getEffectiveStats(card, passiveBonuses = {}) {
  const char = CHARACTERS[card.character_id];
  if (!char) return null;

  const { hpPct = 0, flatSpd = 0 } = passiveBonuses;

  const lvl = card.level - 1;                               // 0-indexed growth steps
  const mm  = MASTERY[card.mastery]?.masteryMult ?? 0;      // mastery multiplier
  const starPct = card.stars * PRESTIGE_STAT_BONUS;         // e.g. 3⭐ → 0.60

  // Inner values: base × (1 + masteryMult) + level growth
  const iAtkMin = char.baseAtkMin * (1 + mm) + lvl * char.atkGrowth;
  const iAtkMax = char.baseAtkMax * (1 + mm) + lvl * char.atkGrowth;
  const iHp     = char.baseHp    * (1 + mm) + lvl * char.hpGrowth;
  const iSpd    = char.baseSpd   * (1 + mm) + lvl * char.spdGrowth;

  // Percentage multipliers — all bonuses summed, applied once
  const atkMult = 1 + starPct;
  const hpMult  = 1 + starPct + hpPct;   // Choji adds to HP only
  const spdMult = 1 + starPct;

  return {
    atkMin:   Math.floor(iAtkMin * atkMult),
    atkMax:   Math.floor(iAtkMax * atkMult),
    hp:       Math.floor(iHp     * hpMult),
    spd:      Math.floor(iSpd    * spdMult) + flatSpd,   // Rock Lee flat added last
    critRate: char.critRate,
  };
}

/**
 * Compute stats at a given mastery level (at level 1, no passive bonuses).
 * Used by N ci to preview M1 / M2 / M3 stats.
 */
function getStatsAtMastery(charId, masteryLevel) {
  const char = CHARACTERS[charId];
  if (!char) return null;
  const mm = MASTERY[masteryLevel]?.masteryMult ?? 0;

  return {
    atkMin:   Math.floor(char.baseAtkMin * (1 + mm)),
    atkMax:   Math.floor(char.baseAtkMax * (1 + mm)),
    hp:       Math.floor(char.baseHp     * (1 + mm)),
    spd:      Math.floor(char.baseSpd    * (1 + mm)),
    critRate: char.critRate,
  };
}

/**
 * Human-readable attack range string, e.g. "55–80".
 */
function formatAtk(atkMin, atkMax) {
  return `${atkMin}–${atkMax}`;
}

/**
 * Renders stars as ⭐ characters. Returns empty string if stars === 0.
 */
function starsDisplay(stars) {
  if (!stars) return '';
  return '⭐'.repeat(stars);
}

/**
 * Returns the rarity badge string: emoji + label.
 */
function rarityBadge(rarityKey) {
  const r = RARITIES[rarityKey];
  if (!r) return rarityKey;
  return `${r.emoji} ${r.label}`;
}

/**
 * Returns the rarity colour (integer) for Discord embeds.
 */
function rarityColor(rarityKey) {
  return RARITIES[rarityKey]?.color ?? 0x1A1A2E;
}

/**
 * Rough "team power" metric — average of all cards' (atkMid + hp/10 + spd/5).
 * Accepts optional passiveBonuses to apply in power calc.
 */
function getTeamPower(cards, passiveBonuses = {}) {
  if (!cards.length) return 0;
  return cards.reduce((sum, card) => {
    const s = getEffectiveStats(card, passiveBonuses);
    if (!s) return sum;
    return sum + ((s.atkMin + s.atkMax) / 2) + (s.hp / 10) + (s.spd / 5);
  }, 0) / cards.length;
}

/**
 * Converts a card's exp into a compact "X / Y XP" string.
 */
function expBar(card) {
  const { expToNextLevel } = require('../config');
  const cap = MASTERY[card.mastery]?.levelCap ?? 100;
  if (card.level >= cap) return `Level cap reached (${cap})`;
  const needed = expToNextLevel(card.level);
  return `${card.exp.toLocaleString()} / ${needed.toLocaleString()} XP`;
}

module.exports = {
  getEffectiveStats,
  getStatsAtMastery,
  formatAtk,
  starsDisplay,
  rarityBadge,
  rarityColor,
  getTeamPower,
  expBar,
};
