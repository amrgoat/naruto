// ─────────────────────────────────────────────
//  database.js  —  SQLite schema & prepared statements
// ─────────────────────────────────────────────

const { Database } = require('node-sqlite3-wasm');
const path         = require('path');
const { PULLS_PER_PERIOD, ARENA_ATTEMPTS_PER_DAY, STARTING_RYO, STARTING_RAMEN } = require('./config');

const db = new Database(path.join(__dirname, '..', 'data.db'));
db.exec('PRAGMA foreign_keys = ON');

// node-sqlite3-wasm only binds the first spread argument; wrap prepare()
// so every statement receives args as an array — no call-sites need changing.
const _prepare = db.prepare.bind(db);
db.prepare = (sql) => {
  const stmt = _prepare(sql);
  return {
    run: (...args) => stmt.run(args),
    get: (...args) => stmt.get(args),
    all: (...args) => stmt.all(args),
  };
};

// ── Schema ────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    discord_id      TEXT    PRIMARY KEY,
    username        TEXT    NOT NULL,
    ryo             INTEGER NOT NULL DEFAULT ${STARTING_RYO},
    ramen           INTEGER NOT NULL DEFAULT ${STARTING_RAMEN},
    pulls_remaining INTEGER NOT NULL DEFAULT ${PULLS_PER_PERIOD},
    pulls_reset_at  INTEGER NOT NULL DEFAULT 0,
    last_pull_time  INTEGER NOT NULL DEFAULT 0,
    arena_attempts  INTEGER NOT NULL DEFAULT ${ARENA_ATTEMPTS_PER_DAY},
    arena_reset_at  INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS cards (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT    NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
    character_id  TEXT    NOT NULL,
    level         INTEGER NOT NULL DEFAULT 1,
    exp           INTEGER NOT NULL DEFAULT 0,
    mastery       INTEGER NOT NULL DEFAULT 1,
    stars         INTEGER NOT NULL DEFAULT 0,
    fragments     INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);

  CREATE TABLE IF NOT EXISTS teams (
    user_id  TEXT    NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
    card_id  INTEGER NOT NULL REFERENCES cards(id)         ON DELETE CASCADE,
    slot     INTEGER NOT NULL,
    PRIMARY KEY (user_id, slot)
  );

  CREATE INDEX IF NOT EXISTS idx_teams_user ON teams(user_id);

  CREATE TABLE IF NOT EXISTS fragment_inventory (
    user_id      TEXT    NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
    character_id TEXT    NOT NULL,
    count        INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, character_id)
  );

  CREATE INDEX IF NOT EXISTS idx_fraginv_user ON fragment_inventory(user_id);
`);

// ── Safe migrations ───────────────────────────
// Add new columns if they don't exist yet (safe to re-run).
for (const col of [
  'chakra_essence        INTEGER NOT NULL DEFAULT 0',
  'daily_reset_at        INTEGER NOT NULL DEFAULT 0',
  'exp_scrolls           INTEGER NOT NULL DEFAULT 0',
  'daily_streak          INTEGER NOT NULL DEFAULT 0',
  'daily_streak_last_day INTEGER NOT NULL DEFAULT 0',
  'is_premium            INTEGER NOT NULL DEFAULT 0',
  'premium_expires_at    INTEGER NOT NULL DEFAULT 0',
]) {
  try { db.exec(`ALTER TABLE users ADD COLUMN ${col}`); } catch { /* already exists */ }
}

// ── Prepared Statements ───────────────────────

const q = {
  // ── Users ──────────────────────────────
  getUser: db.prepare(`SELECT * FROM users WHERE discord_id = ?`),

  insertUser: db.prepare(`
    INSERT OR IGNORE INTO users (discord_id, username)
    VALUES (?, ?)
  `),

  updateUsername: db.prepare(`
    UPDATE users SET username = ? WHERE discord_id = ?
  `),

  /** Deduct 1 pull and record the time */
  consumePull: db.prepare(`
    UPDATE users
    SET pulls_remaining = pulls_remaining - 1,
        last_pull_time  = ?
    WHERE discord_id = ?
  `),

  /** Called when a new reset period is detected before pulling */
  resetPulls: db.prepare(`
    UPDATE users
    SET pulls_remaining = ${PULLS_PER_PERIOD},
        pulls_reset_at  = ?,
        last_pull_time  = 0
    WHERE discord_id = ?
  `),

  /** Ramen restores all pulls without touching reset timestamp */
  ramenRestorePulls: db.prepare(`
    UPDATE users
    SET pulls_remaining = ${PULLS_PER_PERIOD},
        ramen = ramen - 1
    WHERE discord_id = ?
  `),

  addRyo:           db.prepare(`UPDATE users SET ryo            = ryo            + ? WHERE discord_id = ?`),
  addRamen:         db.prepare(`UPDATE users SET ramen          = ramen          + ? WHERE discord_id = ?`),
  addChakraEssence: db.prepare(`UPDATE users SET chakra_essence = chakra_essence + ? WHERE discord_id = ?`),
  addExpScrolls:    db.prepare(`UPDATE users SET exp_scrolls    = exp_scrolls    + ? WHERE discord_id = ?`),
  setDailyReset:    db.prepare(`UPDATE users SET daily_reset_at = ? WHERE discord_id = ?`),

  /** Update streak counter and the last-claim IST day */
  updateDailyStreak: db.prepare(`
    UPDATE users SET daily_streak = ?, daily_streak_last_day = ? WHERE discord_id = ?
  `),

  /** Grant or revoke premium (is_premium 0/1, expires_at ms timestamp or 0 for permanent) */
  setPremium: db.prepare(`
    UPDATE users SET is_premium = ?, premium_expires_at = ? WHERE discord_id = ?
  `),

  /** Consume 1 arena attempt; reset if new day */
  consumeArena: db.prepare(`
    UPDATE users SET arena_attempts = arena_attempts - 1 WHERE discord_id = ?
  `),

  resetArena: db.prepare(`
    UPDATE users
    SET arena_attempts = ${ARENA_ATTEMPTS_PER_DAY},
        arena_reset_at = ?
    WHERE discord_id = ?
  `),

  // ── Cards ───────────────────────────────
  getUserCards: db.prepare(`
    SELECT * FROM cards WHERE user_id = ? ORDER BY id
  `),

  /** Get a user's card by character_id (first match) */
  getCardByCharacter: db.prepare(`
    SELECT * FROM cards WHERE user_id = ? AND character_id = ? LIMIT 1
  `),

  getCard: db.prepare(`SELECT * FROM cards WHERE id = ?`),

  insertCard: db.prepare(`
    INSERT INTO cards (user_id, character_id) VALUES (?, ?)
  `),

  /** Add a fragment to a specific card */
  addFragment: db.prepare(`
    UPDATE cards SET fragments = fragments + 1 WHERE id = ?
  `),

  /** Add N fragments to a specific card */
  addFragmentsN: db.prepare(`
    UPDATE cards SET fragments = fragments + ? WHERE id = ?
  `),

  /** Add EXP; leveling is handled in JS */
  addExp: db.prepare(`
    UPDATE cards SET exp = exp + ? WHERE id = ?
  `),

  levelUp: db.prepare(`
    UPDATE cards SET level = level + 1, exp = exp - ? WHERE id = ?
  `),

  /** Upgrade mastery and deduct fragments */
  upgradeMastery: db.prepare(`
    UPDATE cards
    SET mastery   = mastery + 1,
        fragments = fragments - ?
    WHERE id = ?
  `),

  /** Prestige: add 1 star, deduct fragments, reset level & mastery */
  prestige: db.prepare(`
    UPDATE cards
    SET stars     = stars + 1,
        fragments = fragments - ?,
        level     = 1,
        exp       = 0,
        mastery   = 1
    WHERE id = ?
  `),

  // ── Teams ───────────────────────────────
  getTeam: db.prepare(`
    SELECT t.slot, c.*
    FROM teams t
    JOIN cards c ON c.id = t.card_id
    WHERE t.user_id = ?
    ORDER BY t.slot
  `),

  getTeamCardIds: db.prepare(`
    SELECT card_id FROM teams WHERE user_id = ? ORDER BY slot
  `),

  /** Check if a character is already on the team */
  teamHasCharacter: db.prepare(`
    SELECT t.card_id FROM teams t
    JOIN cards c ON c.id = t.card_id
    WHERE t.user_id = ? AND c.character_id = ?
    LIMIT 1
  `),

  addToTeam: db.prepare(`
    INSERT INTO teams (user_id, card_id, slot) VALUES (?, ?, ?)
  `),

  removeFromTeamByCard: db.prepare(`
    DELETE FROM teams WHERE user_id = ? AND card_id = ?
  `),

  clearTeam: db.prepare(`DELETE FROM teams WHERE user_id = ?`),

  teamSize: db.prepare(`SELECT COUNT(*) as count FROM teams WHERE user_id = ?`),

  // ── Fragment Inventory ─────────────────────
  /** All fragment entries for a user with count > 0, sorted by count desc */
  getFragInv: db.prepare(`
    SELECT character_id, count FROM fragment_inventory
    WHERE user_id = ? AND count > 0
    ORDER BY count DESC
  `),

  /** Single entry for one user+character */
  getFragEntry: db.prepare(`
    SELECT count FROM fragment_inventory WHERE user_id = ? AND character_id = ?
  `),

  /** Add 1 fragment (capped at 500). Upserts the row. */
  addFrag: db.prepare(`
    INSERT INTO fragment_inventory (user_id, character_id, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, character_id) DO UPDATE SET count = MIN(count + 1, 500)
  `),

  /** Deduct N fragments */
  deductFrag: db.prepare(`
    UPDATE fragment_inventory SET count = count - ? WHERE user_id = ? AND character_id = ?
  `),

  /** Directly set fragment count (admin use) */
  setFrag: db.prepare(`
    INSERT INTO fragment_inventory (user_id, character_id, count) VALUES (?, ?, ?)
    ON CONFLICT(user_id, character_id) DO UPDATE SET count = MIN(count + ?, 500)
  `),
};

// ── getUserCards doesn't have rarity_order column — fix with a view-style query
q.getUserCards = db.prepare(`SELECT * FROM cards WHERE user_id = ? ORDER BY id`);

/**
 * Give EXP to a card, handling level-ups up to the mastery cap.
 * Returns the updated card row.
 * @param {number} cardId
 * @param {number} expAmount
 * @param {Object} masteryData  — MASTERY config object { [tier]: { levelCap } }
 */
function giveExpToCard(cardId, expAmount, masteryData) {
  const { expToNextLevel } = require('./config');
  let card = q.getCard.get(cardId);
  if (!card) return null;

  const levelCap = masteryData[card.mastery]?.levelCap ?? 100;
  let remaining = expAmount;

  while (remaining > 0 && card.level < levelCap) {
    const needed = expToNextLevel(card.level);
    const newExp = card.exp + remaining;
    if (newExp >= needed) {
      q.levelUp.run(needed, card.id);
      remaining = newExp - needed;
    } else {
      q.addExp.run(remaining, card.id);
      remaining = 0;
    }
    card = q.getCard.get(card.id);
  }

  return card;
}

module.exports = { db, q, giveExpToCard };
