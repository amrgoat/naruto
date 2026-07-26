// ─────────────────────────────────────────────
//  scrollEngine.js  —  Scroll reward rolling, application, and formatting
//
//  Fully config-driven. Add new reward types to scroll_rewards.json and
//  register their DB writer in REWARD_APPLIERS below — command logic stays untouched.
// ─────────────────────────────────────────────

const REWARDS_CONFIG  = require('../data/scroll_rewards.json');
const { PULL_POOL, CHARACTERS } = require('../data/characters');

// ── Lookup helpers ────────────────────────────

/** Keyword → scroll key map (case-insensitive detection in the command) */
const SCROLL_ALIASES = {
  academy : 'academy',
  chunin  : 'chunin',
  mission : 'mission',
  jonin   : 'jonin',
  anbu    : 'anbu',
  hokage  : 'hokage',
};

/**
 * Resolve a user-supplied word (e.g. "academy", "Hokage", "ANBU") to a scroll key.
 * Returns the scroll key string or null if unrecognised.
 */
function resolveScrollKey(word) {
  if (!word) return null;
  return SCROLL_ALIASES[word.toLowerCase()] ?? null;
}

// ── Math helpers ──────────────────────────────

/** Inclusive random integer between min and max */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Weighted random pick from a { key: weight } object.
 * Weights do not need to sum to 100.
 */
function weightedRandom(pool) {
  const entries = Object.entries(pool);
  const total   = entries.reduce((sum, [, w]) => sum + w, 0);
  let   rand    = Math.random() * total;
  for (const [key, weight] of entries) {
    rand -= weight;
    if (rand <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// ── Core rolling ──────────────────────────────

/**
 * Roll the rewards for a single scroll of the given key.
 * Returns a rewards object:
 *   { ryo?: number, essence?: number, ramen?: number, exp_scrolls?: number,
 *     fragments?: Array<{ characterId, characterName, rarity }> }
 * Only keys that actually dropped are present.
 */
function rollOneScroll(scrollKey) {
  const scroll  = REWARDS_CONFIG[scrollKey];
  const result  = {};

  for (const [rewardType, cfg] of Object.entries(scroll.rewards)) {
    if (!cfg.enabled) continue;
    if (Math.random() > cfg.drop_chance) continue;

    if (rewardType === 'fragments') {
      // ── Fragment drops — each roll is fully independent ──
      const numDrops = randInt(cfg.min_drops, cfg.max_drops);
      const drops    = [];

      for (let i = 0; i < numDrops; i++) {
        const rarity = weightedRandom(cfg.rarity_pool);
        const pool   = PULL_POOL[rarity] ?? [];
        if (!pool.length) continue;

        const charId = pool[Math.floor(Math.random() * pool.length)];
        const char   = CHARACTERS[charId];
        drops.push({ characterId: charId, characterName: char?.name ?? charId, rarity });
      }

      if (drops.length) result.fragments = drops;

    } else {
      // ── Scalar reward ──
      const amount      = randInt(cfg.min, cfg.max);
      result[rewardType] = (result[rewardType] ?? 0) + amount;
    }
  }

  return result;
}

/**
 * Roll rewards for `count` scrolls and combine them into one summary.
 * Scalar rewards are summed; fragment arrays are concatenated (duplicates kept).
 */
function rollScrolls(scrollKey, count) {
  const combined = {};

  for (let i = 0; i < count; i++) {
    const rewards = rollOneScroll(scrollKey);

    for (const [key, val] of Object.entries(rewards)) {
      if (key === 'fragments') {
        combined.fragments = (combined.fragments ?? []).concat(val);
      } else {
        combined[key] = (combined[key] ?? 0) + val;
      }
    }
  }

  return combined;
}

// ── DB application ────────────────────────────

/**
 * Map of reward type → function(q, amount, userId) that writes to the DB.
 * Add an entry here when introducing a new reward type.
 */
function buildRewardAppliers(q) {
  return {
    ryo        : (amount, uid) => q.addRyo.run(amount, uid),
    essence    : (amount, uid) => q.addChakraEssence.run(amount, uid),
    ramen      : (amount, uid) => q.addRamen.run(amount, uid),
    exp_scrolls: (amount, uid) => q.addExpScrolls.run(amount, uid),
    // fragments handled separately (one addFrag call per drop)
  };
}

/**
 * Apply combined rewards to the DB and deduct the opened scrolls.
 * @param {object} q               — prepared statement map from database.js
 * @param {object} scrollStatements — scroll-specific add/deduct statements
 * @param {string} userId
 * @param {string} scrollKey
 * @param {number} count           — number of scrolls opened
 * @param {object} combined        — output of rollScrolls()
 */
function applyRewards(q, scrollStatements, userId, scrollKey, count, combined) {
  const scroll   = REWARDS_CONFIG[scrollKey];
  const appliers = buildRewardAppliers(q);

  // Deduct scrolls from inventory
  scrollStatements[scroll.db_col].deduct.run(count, userId);

  // Apply each scalar reward
  for (const [rewardType, amount] of Object.entries(combined)) {
    if (rewardType === 'fragments') continue;
    appliers[rewardType]?.(amount, userId);
  }

  // Apply fragment drops — one DB call per drop (keeps count accurate)
  for (const frag of (combined.fragments ?? [])) {
    q.addFrag.run(userId, frag.characterId);
  }
}

// ── Display formatting ────────────────────────

/**
 * Build the reward display lines for the embed description.
 * Reads labels/emojis from scroll_rewards.json so new reward types display
 * automatically without touching this file.
 *
 * @param {object} combined    — output of rollScrolls()
 * @param {string} scrollKey
 * @returns {string[]}         — array of display lines, or [] if nothing dropped
 */
function formatRewardLines(combined, scrollKey) {
  const scroll = REWARDS_CONFIG[scrollKey];
  const lines  = [];

  // Scalar rewards — iterate config order for consistent display
  for (const [rewardType, cfg] of Object.entries(scroll.rewards)) {
    if (rewardType === 'fragments') continue;
    const amount = combined[rewardType];
    if (!amount) continue;
    lines.push(`${cfg.emoji} **+${amount.toLocaleString()}** ${cfg.label}`);
  }

  // Fragments — one line per drop, duplicates shown separately
  if (combined.fragments?.length) {
    lines.push(''); // spacer
    for (const frag of combined.fragments) {
      const fragCfg = scroll.rewards.fragments;
      lines.push(`${fragCfg.emoji} **${frag.characterName} Fragment**`);
    }
  }

  return lines;
}

module.exports = {
  REWARDS_CONFIG,
  resolveScrollKey,
  rollScrolls,
  applyRewards,
  formatRewardLines,
};
