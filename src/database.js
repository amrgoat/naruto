// ─────────────────────────────────────────────
//  database.js  —  SQLite schema & prepared statements
// ─────────────────────────────────────────────

const { Database } = require('node-sqlite3-wasm');
const path         = require('path');
const { PULLS_PER_PERIOD, ARENA_ATTEMPTS_PER_DAY, STARTING_RYO, STARTING_RAMEN } = require('./config');

const DB_PATH = path.join(__dirname, '..', 'data.db');

// On rapid workflow restarts the previous process may still hold a write lock.
// Retry the entire open+PRAGMA sequence up to 10 times (500 ms apart).
let db;
for (let attempt = 1; attempt <= 10; attempt++) {
  try {
    db = new Database(DB_PATH);
    // busy_timeout must come first so subsequent DDL waits instead of throwing
    db.exec('PRAGMA busy_timeout  = 5000');
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys  = ON');
    break;
  } catch (err) {
    try { db?.close(); } catch (_) {}
    if (attempt === 10) throw err;
    require('child_process').execSync('sleep 0.5');
  }
}

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
    level         INTEGER NOT NULL DEFAULT 0,
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

// ── Expedition table ──────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS expeditions (
    user_id    TEXT    PRIMARY KEY REFERENCES users(discord_id) ON DELETE CASCADE,
    area_key   TEXT    NOT NULL,
    started_at INTEGER NOT NULL,
    ends_at    INTEGER NOT NULL
  );
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
  'total_pulls           INTEGER NOT NULL DEFAULT 0',
  'mission_cooldown_at   INTEGER NOT NULL DEFAULT 0',
  'missions_finished     INTEGER NOT NULL DEFAULT 0',
  'mission_scrolls       INTEGER NOT NULL DEFAULT 0',
  'academy_scrolls       INTEGER NOT NULL DEFAULT 0',
  'chunin_scrolls        INTEGER NOT NULL DEFAULT 0',
  'jonin_scrolls         INTEGER NOT NULL DEFAULT 0',
  'anbu_scrolls          INTEGER NOT NULL DEFAULT 0',
  'hokage_scrolls        INTEGER NOT NULL DEFAULT 0',
  // User level system
  'user_level            INTEGER NOT NULL DEFAULT 1',
  'user_exp              INTEGER NOT NULL DEFAULT 0',
  // Shop daily limits
  'shop_reset_at              INTEGER NOT NULL DEFAULT 0',
  'shop_ramen_bought          INTEGER NOT NULL DEFAULT 0',
  'shop_random_bought         INTEGER NOT NULL DEFAULT 0',
  'shop_exp_bought            INTEGER NOT NULL DEFAULT 0',
  'shop_chakra_bought         INTEGER NOT NULL DEFAULT 0',
  // Shop daily limit — trial tickets
  'shop_ticket_bought         INTEGER NOT NULL DEFAULT 0',
  // Trial tickets — one per difficulty
  'academy_trial_tickets      INTEGER NOT NULL DEFAULT 0',
  'chunin_trial_tickets       INTEGER NOT NULL DEFAULT 0',
  'jonin_trial_tickets        INTEGER NOT NULL DEFAULT 0',
  'anbu_trial_tickets         INTEGER NOT NULL DEFAULT 0',
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

  addTotalPull:        db.prepare(`UPDATE users SET total_pulls      = total_pulls      + 1 WHERE discord_id = ?`),
  setMissionCooldown:  db.prepare(`UPDATE users SET mission_cooldown_at = ?             WHERE discord_id = ?`),
  addMissionsFinished: db.prepare(`UPDATE users SET missions_finished  = missions_finished + 1 WHERE discord_id = ?`),
  addMissionScrolls:   db.prepare(`UPDATE users SET mission_scrolls   = mission_scrolls  + 1 WHERE discord_id = ?`),
  addRyo:           db.prepare(`UPDATE users SET ryo            = ryo            + ? WHERE discord_id = ?`),
  addRamen:         db.prepare(`UPDATE users SET ramen          = ramen          + ? WHERE discord_id = ?`),
  addChakraEssence:    db.prepare(`UPDATE users SET chakra_essence = chakra_essence + ? WHERE discord_id = ?`),
  deductChakraEssence: db.prepare(`UPDATE users SET chakra_essence = MAX(0, chakra_essence - ?) WHERE discord_id = ?`),
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

  /** Set level and exp directly (used by giveExpToCard) */
  setLevelAndExp: db.prepare(`
    UPDATE cards SET level = ?, exp = ? WHERE id = ?
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
        level     = 0,
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

  // ── User level ──────────────────────────────
  setUserLevelAndExp: db.prepare(`
    UPDATE users SET user_level = ?, user_exp = ? WHERE discord_id = ?
  `),

  // ── Shop daily limits ───────────────────────
  resetShop: db.prepare(`
    UPDATE users SET shop_reset_at = ?, shop_ramen_bought = 0,
    shop_random_bought = 0, shop_exp_bought = 0, shop_chakra_bought = 0,
    shop_ticket_bought = 0
    WHERE discord_id = ?
  `),
  incrementShopCol: {
    shop_ramen_bought:  db.prepare(`UPDATE users SET shop_ramen_bought  = shop_ramen_bought  + ? WHERE discord_id = ?`),
    shop_random_bought: db.prepare(`UPDATE users SET shop_random_bought = shop_random_bought + ? WHERE discord_id = ?`),
    shop_exp_bought:    db.prepare(`UPDATE users SET shop_exp_bought    = shop_exp_bought    + ? WHERE discord_id = ?`),
    shop_chakra_bought:  db.prepare(`UPDATE users SET shop_chakra_bought  = shop_chakra_bought  + ? WHERE discord_id = ?`),
    shop_ticket_bought:  db.prepare(`UPDATE users SET shop_ticket_bought  = shop_ticket_bought  + ? WHERE discord_id = ?`),
  },
  deductRyo: db.prepare(`UPDATE users SET ryo = ryo - ? WHERE discord_id = ?`),
  addRamen:  db.prepare(`UPDATE users SET ramen = ramen + ? WHERE discord_id = ?`),

  // ── Expeditions ─────────────────────────────
  getExpedition: db.prepare(`SELECT * FROM expeditions WHERE user_id = ?`),
  startExpedition: db.prepare(`
    INSERT INTO expeditions (user_id, area_key, started_at, ends_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET area_key = ?, started_at = ?, ends_at = ?
  `),
  clearExpedition: db.prepare(`DELETE FROM expeditions WHERE user_id = ?`),
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
  const card = q.getCard.get(cardId);
  if (!card) return null;

  const levelCap = masteryData[card.mastery]?.levelCap ?? 100;
  let pool     = card.exp + expAmount;
  let newLevel = card.level;

  // Calculate all level-ups in JS first — no intermediate DB reads
  while (newLevel < levelCap) {
    const needed = expToNextLevel(newLevel);
    if (pool >= needed) {
      pool -= needed;
      newLevel++;
    } else {
      break;
    }
  }

  // Single write: set final level and leftover EXP
  q.setLevelAndExp.run(newLevel, pool, cardId);
  return q.getCard.get(cardId);
}

// ── Scroll inventory statements ───────────────
// Keyed by db_col name (matches SCROLL_REWARDS db_col values in src/config.js).
const SCROLL_COLS = [
  'academy_scrolls',
  'chunin_scrolls',
  'mission_scrolls',
  'jonin_scrolls',
  'anbu_scrolls',
  'hokage_scrolls',
];

const scrollStatements = {};
for (const col of SCROLL_COLS) {
  scrollStatements[col] = {
    add:    db.prepare(`UPDATE users SET ${col} = ${col} + ? WHERE discord_id = ?`),
    deduct: db.prepare(`UPDATE users SET ${col} = MAX(0, ${col} - ?) WHERE discord_id = ?`),
  };
}

/**
 * Give EXP to a USER, levelling them up as needed.
 * Returns the updated user row.
 */
function giveExpToUser(userId, expAmount) {
  const { USER_EXP_PER_LEVEL } = require('./config');
  const user = q.getUser.get(userId);
  if (!user) return null;

  let pool  = (user.user_exp   ?? 0) + expAmount;
  let level = (user.user_level ?? 1);

  const MAX_USER_LEVEL = 999;
  while (pool >= USER_EXP_PER_LEVEL && level < MAX_USER_LEVEL) {
    pool -= USER_EXP_PER_LEVEL;
    level++;
  }
  // At max level, stop accumulating EXP
  if (level >= MAX_USER_LEVEL) {
    level = MAX_USER_LEVEL;
    pool  = 0;
  }

  q.setUserLevelAndExp.run(level, pool, userId);
  return q.getUser.get(userId);
}

// ── Trial ticket statements ───────────────────
const TRIAL_TICKET_COLS = [
  'academy_trial_tickets',
  'chunin_trial_tickets',
  'jonin_trial_tickets',
  'anbu_trial_tickets',
];

const trialTicketStatements = {};
for (const col of TRIAL_TICKET_COLS) {
  trialTicketStatements[col] = {
    add:    db.prepare(`UPDATE users SET ${col} = ${col} + ? WHERE discord_id = ?`),
    deduct: db.prepare(`UPDATE users SET ${col} = MAX(0, ${col} - ?) WHERE discord_id = ?`),
  };
}

module.exports = { db, q, giveExpToCard, giveExpToUser, scrollStatements, trialTicketStatements };
