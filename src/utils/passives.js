// ─────────────────────────────────────────────
//  passives.js  —  Passive card definitions & resolution
//
//  Passives are active just by OWNING the card.
//  The card does NOT need to be in the battle team.
//
//  Each entry: { label, describe(m), describeAll[], effect(m) }
//  effect(m) returns a plain object with bonus keys.
// ─────────────────────────────────────────────

const { q } = require('../database');

// ── Passive Definitions ───────────────────────
const PASSIVES = {

  // ── Support ───────────────────────────────
  teuchi: {
    label:       "Teuchi's Ramen",
    describe:    m => `+${[1, 2, 4][m - 1]} Ramen from N daily`,
    describeAll: [
      'M1 — +1 Ramen from N daily',
      'M2 — +2 Ramen from N daily',
      'M3 — +4 Ramen from N daily',
    ],
    effect: m => ({ dailyRamen: [1, 2, 4][m - 1] }),
  },

  // ── Combat ────────────────────────────────
  konohamaru: {
    label:       "Hokage's Allowance",
    describe:    m => `+${[500, 1_000, 3_000][m - 1].toLocaleString()} Ryo from N daily`,
    describeAll: [
      'M1 — +500 Ryo from N daily',
      'M2 — +1,000 Ryo from N daily',
      'M3 — +3,000 Ryo from N daily',
    ],
    effect: m => ({ dailyRyo: [500, 1_000, 3_000][m - 1] }),
  },

  tsunade: {
    label:       "Gambler's Fortune",
    describe:    () => '1% chance to win +10,000 Ryo from N daily',
    describeAll: [
      'M1 — 1% jackpot chance: +10,000 Ryo from N daily',
      'M2 — 1% jackpot chance: +10,000 Ryo from N daily',
      'M3 — 1% jackpot chance: +10,000 Ryo from N daily',
    ],
    effect: () => ({ tsunadeJackpot: true }),
  },

  orochimaru: {
    label:    'Laboratory Access',
    describe: m => {
      if (m >= 3) return 'Unlock Lab (D–S crafting) · 20% discount · Duplicates → Chakra Essence';
      if (m >= 2) return 'Unlock Lab (D–S crafting)';
      return 'Unlock Lab (D–A crafting)';
    },
    describeAll: [
      'M1 — Unlock Laboratory · Craft D–A rank fragments',
      'M2 — Unlock S rank fragment crafting',
      'M3 — 20% crafting discount · Duplicates → Chakra Essence',
    ],
    effect: m => ({
      unlockLab:    true,
      labSRank:     m >= 2,
      labDiscount:  m >= 3 ? 0.20 : 0,
      dupToEssence: m >= 3,
    }),
  },

  iruka: {
    label:       "Sensei's Guidance",
    describe:    m => `+${[10, 20, 40][m - 1]}% Arena EXP`,
    describeAll: [
      'M1 — +10% Arena EXP',
      'M2 — +20% Arena EXP',
      'M3 — +40% Arena EXP',
    ],
    effect: m => ({ arenaExpBonus: [0.10, 0.20, 0.40][m - 1] }),
  },

  choji: {
    label:       'Clan Fortitude',
    describe:    m => `+${[5, 10, 20][m - 1]}% HP for all owned cards`,
    describeAll: [
      'M1 — +5% HP for all owned cards',
      'M2 — +10% HP for all owned cards',
      'M3 — +20% HP for all owned cards',
    ],
    effect: m => ({ hpPct: [0.05, 0.10, 0.20][m - 1] }),
  },

  rock_lee: {
    label:       'Speed of Youth',
    describe:    m => `+${[5, 10, 20][m - 1]} Speed for all owned cards`,
    describeAll: [
      'M1 — +5 Speed for all owned cards',
      'M2 — +10 Speed for all owned cards',
      'M3 — +20 Speed for all owned cards',
    ],
    effect: m => ({ flatSpd: [5, 10, 20][m - 1] }),
  },

  baki: {
    label:       'Sand Commander',
    describe:    () => 'Unlocks the Arena',
    describeAll: [
      'M1 — Unlocks the Arena',
      'M2 — Unlocks the Arena',
      'M3 — Unlocks the Arena',
    ],
    effect: () => ({ unlockArena: true }),
  },

};

// ── Resolution ────────────────────────────────

/**
 * Aggregate every active passive bonus for a user.
 * Works off ALL owned cards (not just team cards).
 *
 * @param {string} userId
 * @returns {{
 *   hpPct: number,         flatSpd: number,
 *   arenaExpBonus: number, dailyRyo: number,
 *   dailyRamen: number,    tsunadeJackpot: boolean,
 *   unlockLab: boolean,    labSRank: boolean,
 *   labDiscount: number,   dupToEssence: boolean,
 *   unlockArena: boolean,
 * }}
 */
function resolvePassiveBonuses(userId) {
  const cards = q.getUserCards.all(userId);

  const bonuses = {
    hpPct:          0,
    flatSpd:        0,
    arenaExpBonus:  0,
    dailyRyo:       0,
    dailyRamen:     0,
    tsunadeJackpot: false,
    unlockLab:      false,
    labSRank:       false,
    labDiscount:    0,
    dupToEssence:   false,
    unlockArena:    false,
  };

  for (const card of cards) {
    const passive = PASSIVES[card.character_id];
    if (!passive) continue;
    const fx = passive.effect(card.mastery);
    if (fx.hpPct)          bonuses.hpPct         += fx.hpPct;
    if (fx.flatSpd)        bonuses.flatSpd       += fx.flatSpd;
    if (fx.arenaExpBonus)  bonuses.arenaExpBonus += fx.arenaExpBonus;
    if (fx.dailyRyo)       bonuses.dailyRyo      += fx.dailyRyo;
    if (fx.dailyRamen)     bonuses.dailyRamen    += fx.dailyRamen;
    if (fx.tsunadeJackpot) bonuses.tsunadeJackpot = true;
    if (fx.unlockLab)      bonuses.unlockLab     = true;
    if (fx.labSRank)       bonuses.labSRank      = true;
    if (fx.labDiscount)    bonuses.labDiscount   = fx.labDiscount;
    if (fx.dupToEssence)   bonuses.dupToEssence  = true;
    if (fx.unlockArena)    bonuses.unlockArena   = true;
  }

  return bonuses;
}

module.exports = { PASSIVES, resolvePassiveBonuses };
