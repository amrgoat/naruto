// ─────────────────────────────────────────────
//  hpBar.js  —  reusable HP bar renderer
//
//  All emoji names and IDs live in src/config.js (HP_BAR).
//  Nothing is hardcoded here.
//
//  Usage:
//    const { buildHpBar } = require('./hpBar');
//    const bar = buildHpBar(currentHp, maxHp);
// ─────────────────────────────────────────────

const { HP_BAR: HP } = require('../config');

/**
 * Builds a 10-emoji HP bar string.
 *
 * Calculation:
 *  • 0 %        → all-empty bar
 *  • 1–4 %      → NhpStart1r  + 8× NhpMid0 + NhpEnd0
 *  • 5–100 %    → round DOWN to nearest 5, then fill slots
 *
 * Color tiers (based on rawPct):
 *  • > 50 %          → green
 *  • > 25 % and ≤ 50 % → yellow
 *  • ≤ 25 %          → red
 *
 * Bar has exactly 10 positions:
 *  pos 0 → Start,  pos 1–8 → Mid,  pos 9 → End
 *  Each position represents 10 % and can be 10 (full), 5 (half), or 0 (empty).
 *
 * @param {number} current  Current HP value
 * @param {number} max      Maximum HP value
 * @returns {string}        10-emoji Discord string
 */
function buildHpBar(current, max) {
  // Guard: invalid max
  if (!max || max <= 0) {
    return HP.NhpStart0 + HP.NhpMid0.repeat(8) + HP.NhpEnd0;
  }

  const rawPct = (Math.max(0, Math.min(current, max)) / max) * 100;

  // ── 0 % — all empty ───────────────────────────────────
  if (rawPct <= 0) {
    return HP.NhpStart0 + HP.NhpMid0.repeat(8) + HP.NhpEnd0;
  }

  // ── 1–4 % — one red sliver ────────────────────────────
  if (rawPct <= 4) {
    return HP.NhpStart1r + HP.NhpMid0.repeat(8) + HP.NhpEnd0;
  }

  // ── 5–100 % — round down to nearest 5 ────────────────
  const pct = Math.floor(rawPct / 5) * 5;          // e.g. 87 → 85

  // Color tier (use unrounded rawPct for comparison)
  const color = rawPct > 50 ? 'g' : rawPct > 25 ? 'y' : 'r';

  const fullCells = Math.floor(pct / 10);           // how many completely filled slots
  const hasHalf   = (pct % 10) === 5;              // is there a half-filled slot?

  const bar = [];

  for (let i = 0; i < 10; i++) {
    const isStart  = i === 0;
    const isEnd    = i === 9;
    const pos      = isStart ? 'Start' : isEnd ? 'End' : 'Mid';

    // Determine fill value for this position
    const fill = i < fullCells            ? 10
               : (i === fullCells && hasHalf) ? 5
               :                               0;

    if (fill === 0) {
      bar.push(HP[`Nhp${pos}0`]);
      continue;
    }

    if (fill === 10) {
      if (color === 'g') {
        // Green: Start10g / Mid10g / End10g all exist
        bar.push(HP[`Nhp${pos}10g`]);
      } else if (color === 'y') {
        // Yellow: Start10y / Mid10y exist; End10y doesn't — but yellow max is 50%
        // so the End position is never full in yellow.
        bar.push(HP[`Nhp${pos}10y`]);
      } else {
        // Red: Start10r / Mid10r exist; End10r doesn't — but red max is 25%
        // so the End position is never full in red.
        bar.push(HP[`Nhp${pos}10r`]);
      }
      continue;
    }

    // fill === 5 (half-slot)
    if (color === 'g') {
      // Green halves: Mid5g / End5g exist; Start5g never occurs (green ≥ 55%)
      bar.push(HP[`Nhp${pos}5g`]);
    } else if (color === 'y') {
      // Yellow halves: always a Mid position (yellow range 26–50%)
      // NhpMid5y covers every half in yellow; no Start5y / End5y needed
      bar.push(HP.NhpMid5y);
    } else {
      // Red halves: position-specific — Start5r (at 5 %) or Mid5r (15 %, 25 %)
      bar.push(HP[`Nhp${pos}5r`]);
    }
  }

  return bar.join('');
}

module.exports = { buildHpBar };
