// ─────────────────────────────────────────────
//  trialEngine.js  —  Trial floor interpolation & enemy generation
//
//  Configs live in /towerconfig/<difficulty>.json.
//  Key floors are defined; any floor between them is smoothly
//  interpolated. If a floor number is explicitly defined in the
//  config, its values are used verbatim (no interpolation).
// ─────────────────────────────────────────────

const path = require('path');
const fs   = require('fs');

const CONFIG_DIR  = path.join(__dirname, '..', '..', 'towerconfig');
const configCache = {};

/** Load (and cache) a difficulty config by key. */
function loadConfig(difficulty) {
  if (configCache[difficulty]) return configCache[difficulty];
  const file = path.join(CONFIG_DIR, `${difficulty}.json`);
  configCache[difficulty] = JSON.parse(fs.readFileSync(file, 'utf8'));
  return configCache[difficulty];
}

/**
 * Integer lerp — used for stats (hp, atk, spd, critRate).
 */
function lerp(a, b, t) {
  return Math.round(a + t * (b - a));
}

/**
 * Float lerp — used for reward values so fractional scroll
 * probabilities (e.g. 0.06) are preserved during interpolation.
 */
function lerpFloat(a, b, t) {
  return a + t * (b - a);
}

/**
 * Interpolate a stats block { hp, atkMin, atkMax, spd, critRate }
 * between two key-floor entries at progress `t` (0–1).
 */
function lerpStats(lo, hi, t) {
  return {
    hp:       lerp(lo.hp,       hi.hp,       t),
    atkMin:   lerp(lo.atkMin,   hi.atkMin,   t),
    atkMax:   lerp(lo.atkMax,   hi.atkMax,   t),
    spd:      lerp(lo.spd,      hi.spd,      t),
    critRate: lerp(lo.critRate, hi.critRate, t),
  };
}

/**
 * Given a sorted array of defined key floor numbers and a target floor,
 * return { lower, upper, t } for interpolation.
 * If the floor is before the first key, clamp to it.
 * If after the last, clamp to the last.
 */
function bracket(keys, floor) {
  if (floor <= keys[0]) return { lower: keys[0], upper: keys[0], t: 0 };
  if (floor >= keys[keys.length - 1]) {
    const k = keys[keys.length - 1];
    return { lower: k, upper: k, t: 0 };
  }
  let lower = keys[0], upper = keys[keys.length - 1];
  for (const k of keys) {
    if (k <= floor) lower = k;
  }
  for (const k of keys) {
    if (k >= floor) { upper = k; break; }
  }
  const t = lower === upper ? 0 : (floor - lower) / (upper - lower);
  return { lower, upper, t };
}

/**
 * Return interpolated floor stats for the given floor number.
 * Returns { squad, boss } stat objects.
 * If an exact floor entry exists in the config it takes precedence.
 */
function getFloorStats(config, floor) {
  if (config.floors[floor]) return config.floors[floor];

  const keys = Object.keys(config.floors).map(Number).sort((a, b) => a - b);
  const { lower, upper, t } = bracket(keys, floor);

  const lo = config.floors[lower];
  const hi = config.floors[upper];

  return {
    squad: lerpStats(lo.squad, hi.squad, t),
    boss:  lerpStats(lo.boss,  hi.boss,  t),
  };
}

/**
 * Build the enemy array for a floor.
 * Boss floors (floor % 5 === 0) have 1 enemy; normal floors have 4.
 * Each enemy: { name, level, maxHp, currentHp, atkMin, atkMax, spd, critRate }
 */
function buildEnemies(config, floor) {
  const isBoss = floor % 5 === 0;
  const stats  = getFloorStats(config, floor);

  if (isBoss) {
    const name = config.bossNames?.[floor] ?? config.bossNames?.['default'] ?? 'Trial Boss';
    const s    = stats.boss;
    return [{
      name, level: floor,
      maxHp: s.hp, currentHp: s.hp,
      atkMin: s.atkMin, atkMax: s.atkMax, spd: s.spd, critRate: s.critRate,
    }];
  }

  const names = config.squadEnemyNames;
  const s     = stats.squad;
  return Array.from({ length: 4 }, (_, i) => ({
    name:      names[i % names.length],
    level:     floor,
    maxHp:     s.hp,
    currentHp: s.hp,
    atkMin:    s.atkMin,
    atkMax:    s.atkMax,
    spd:       s.spd,
    critRate:  s.critRate,
  }));
}

/**
 * Return the reward object for clearing a specific floor.
 * Uses float lerp so fractional scroll probabilities are preserved.
 * Integer values (ryo, chakra, exp) are close enough to their
 * intended values; the caller floors them at apply time.
 */
function getFloorReward(config, floor) {
  if (config.rewards[floor]) return { ...config.rewards[floor] };

  const keys = Object.keys(config.rewards).map(Number).sort((a, b) => a - b);
  const { lower, upper, t } = bracket(keys, floor);

  const lo = config.rewards[lower];
  const hi = config.rewards[upper];

  const result = {};
  const allKeys = new Set([...Object.keys(lo), ...Object.keys(hi)]);
  for (const k of allKeys) {
    result[k] = lerpFloat(lo[k] ?? 0, hi[k] ?? 0, t);
  }
  return result;
}

/**
 * Return the max HP an enemy on a given floor has (highest of squad/boss).
 * Used for skip-floors ATK comparison.
 */
function getFloorMaxHp(config, floor) {
  const isBoss = floor % 5 === 0;
  const stats  = getFloorStats(config, floor);
  return isBoss ? stats.boss.hp : stats.squad.hp;
}

module.exports = { loadConfig, getFloorStats, buildEnemies, getFloorReward, getFloorMaxHp };
