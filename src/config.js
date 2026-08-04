// ─────────────────────────────────────────────
//  config.js  —  Global constants & game tuning
//
//  Single source of truth. Merged from:
//    • src/config.js          (constants & tuning)
//    • config/hpbar.json      (HP bar emojis)
//    • towerconfig/*.json     (trial difficulty data)
//    • src/data/scroll_rewards.json
// ─────────────────────────────────────────────

/** All command prefixes that the bot responds to */
const PREFIXES = ['n', 'n ', 'N ', 'N'];

// ── Shared UI Emojis (update here to change everywhere) ──────────────────
const ARROW_EMOJI  = '<:arrow:1530116419381887089>';
const LVLOP_EMOJI  = '<:lvlop:1530058173808115733>';
const WALLET_EMOJI = '<:Nwallet:1530113305417613414>';

// ── Emojis ────────────────────────────────────
const E = {
  ryo:      '<:ryo:1529490447381299230>',
  ramen:    '<:ramen:1529823076118691890>',
  pull:     '📜',
  attack:   '⚔️',
  health:   '❤️',
  speed:    '⚡',
  crit:     '🎯',
  fragment: '💎',
  mastery:  '🔮',
  prestige: '⭐',
  level:    '📈',
  exp:      '✨',
  team:     '🥷',
  arena:    '🏟️',
  battle:   '⚔️',
  win:      '🏆',
  loss:     '💀',
  combat:   '🥷',
  locked:   '🔒',
  ping:     '🏓',
  scroll:   '📜',
  leaf:     '🍃',

  // Arena / Trial UI emojis
  coin:     '🪙',
  essence:  '✨',
  ticket:   '🎫',
  check:    '✅',
  warn:     '⚠️',
  walk:     '🚶',
  arrow:    '➜',
  skull:    '💀',
  robot:    '🤖',
  tower:    '🏯',
  book:     '📚',
  blue:     '🟦',
  orange:   '🟧',
  red:      '🔴',
  clock:    '⏰',
  door:     '🚪',
  play:     '▶',
  skip:     '⏭',
  boss:     '⚡',
};

// ── Scroll type emojis (Trial rewards) ───────
const SCROLL_EMOJIS = {
  academy_scrolls: '📜',
  chunin_scrolls:  '📘',
  jonin_scrolls:   '📙',
  anbu_scrolls:    '📕',
};

// ── HP Bar Emojis (from config/hpbar.json) ──
const HP_BAR = {
  NhpStart0:   '<:NhpStart0:1532425387622006915>',
  NhpMid0:     '<:NhpMid0:1532425225621340201>',
  NhpEnd0:     '<:NhpEnd0:1532424940257808394>',

  NhpStart10g: '<:NhpStart10g:1532433164826312926>',
  NhpMid10g:   '<:NhpMid10g:1532553038462717993>',
  NhpEnd10g:   '<:NhpEnd10g:1532553348497276928>',
  NhpMid5g:    '<:NhpMid5g:1532612329760489674>',
  NhpEnd5g:    '<:NhpEnd5g:1532612330796617868>',

  NhpStart10y: '<:NhpStart10y:1532608581311139941>',
  NhpMid10y:   '<:NhpMid10y:1532608582779011112>',
  NhpMid5y:    '<:NhpMid5y:1532608583730987090>',

  NhpStart10r: '<:NhpStart10r:1532608581357015080>',
  NhpStart5r:  '<:NhpStart5r:1532608581386633383>',
  NhpMid10r:   '<:NhpMid10r:1532608581470392340>',
  NhpMid5r:    '<:NhpMid5r:1532608580581068830>',
  NhpStart1r:  '<:NhpStart1r:1532643708816588841>',
};

// ── Combat Emojis ─────────────────────────────
// Custom Discord emoji references for use ONLY in combat embeds
// (Arena, PvP Battle, Raid, Damage Logs, Combat Result Embeds).
// Do NOT use inside N ci, N mci, collection, shop, lab, or daily.
const COMBAT_EMOJIS = {
  attack:  '<:attack:1529490433179123783>',
  health:  '<:health:1529490384747757709>',
  speed:   '<:speed:1529490438468272148>',
  ryo:     '<:ryo:1529490447381299230>',
  essence: '<:essence:1529490380905644143>',
};

// ── Rarity Definitions ────────────────────────
// SS and UR exist in the system but are locked from pulls
// thumb: provided rarity badge image URL shown as embed thumbnail
const RARITIES = {
  D:  { label: 'D-Rank',  emoji: '<:Drarity:1529858391210721330>', color: 0xB0B0B0, pullWeight: 43.5, locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820114110288033/d.png?ex=6a5fb02f&is=6a5e5eaf&hm=8210d61deadbe0165a3543b43116c15e82602f8e8628409636ff82e7bcaa2d6c&' },
  C:  { label: 'C-Rank',  emoji: '<:Crarity:1529858387301367898>', color: 0x47C74B, pullWeight: 33, locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820113623486564/c.png?ex=6a5fb02f&is=6a5e5eaf&hm=8ecc0eaa5032989e913939f5dd88c7e30782f99bcb3a6aff66a7f734d13228e6&' },
  B:  { label: 'B-Rank',  emoji: '<:Brarity:1529858383069581342>', color: 0x3FA9FF, pullWeight: 21, locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820113279815882/b.png?ex=6a5fb02f&is=6a5e5eaf&hm=d02efdc2ad0df3816aaf357a1cb2923dd604b0f2aa99ca47233dfc5b60d51143&' },
  A:  { label: 'A-Rank',  emoji: '<:Ararity:1529858378866753577>', color: 0xA85FFF, pullWeight: 2,  locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820112864579677/a.png?ex=6a5fb02f&is=6a5e5eaf&hm=8bc34eb624830a6394fdffe54128b2a175966b1ac209c3bb64777e24d677c94b&' },
  S:  { label: 'S-Rank',  emoji: '<:Srarity:1529858395161497670>', color: 0xFFC82E, pullWeight: 0.5,locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820114592628937/s.png?ex=6a5fb02f&is=6a5e5eaf&hm=c6ad8ba10a094c7d5ea7ed1de5f38be9c3896eaed50e446b6610ddd7a723ba12&' },
  SS: { label: 'SS-Rank', emoji: '<:SSrarity:1529858398378786858>', color: 0xF44336, pullWeight: 0,  locked: true,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820115024511056/ss.png?ex=6a5fb02f&is=6a5e5eaf&hm=9c255f07266b0af975b5d8629ecd6b045a8bd1bb48a05d3521957781187be5d1&' },
  UR: { label: 'UR',      emoji: '<:URrarity:1529858402174636174', color: 0xFFF7EC, pullWeight: 0,  locked: true,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820115762577590/ur.png?ex=6a5fb02f&is=6a5e5eaf&hm=f51091992090657ee027541fed0445d2a9e8cdd50fdc4af7d42bd014b4a7eb48&' },
};

/** Only these rarities appear in the pull pool */
const PULL_POOL_RARITIES = Object.entries(RARITIES)
  .filter(([, r]) => !r.locked && r.pullWeight > 0)
  .map(([key]) => key);

// ── Mastery Tiers ─────────────────────────────
//  masteryMult: flat bonus = base × masteryMult, added BEFORE % boosts.
//  Goal: a Level 250 M3 card is ~15× stronger than Level 1 M1.
const MASTERY = {
  1: { label: 'M1', levelCap: 100, masteryMult: 0    },
  2: { label: 'M2', levelCap: 200, masteryMult: 4.0  },
  3: { label: 'M3', levelCap: 250, masteryMult: 10.0 },
};
const MASTERY_UPGRADE_COST = {
  2: 15, // M1 → M2 costs 15 frags
  3: 25, // M2 → M3 costs 25 frags
};

// ── Daily Rewards ─────────────────────────────
//  Base rewards from N daily (before passive bonuses).
const DAILY_REWARDS = {
  ryo:           1000,
  ramen:         1,
  chakraEssence: 30,
  expScrolls:    1,
};

// ── Orochimaru Lab ────────────────────────────
//  Chakra Essence gained when Orochimaru M3 converts a duplicate.
const ESSENCE_PER_DUP = { D: 20, C: 30, B: 50, A: 90, S: 150 };

// ── Prestige ──────────────────────────────────
const MAX_STARS = 5;
const PRESTIGE_COSTS = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 };
const PRESTIGE_STAT_BONUS = 0.20; // +20% per star, additive

// ── Pull System ───────────────────────────────
const PULLS_PER_PERIOD = 12;
const PULL_COOLDOWN_MS  = 3_000; // 3 seconds
const STARTING_RAMEN   = 3;
const STARTING_RYO     = 5000;

// ── Arena ─────────────────────────────────────
const ARENA_ATTEMPTS_PER_DAY = 5;

const ARENA_DIFFICULTIES = {
  easy: {
    label: 'Easy',
    emoji: '🟢',
    description: 'Academy graduates. A good warm-up.',
    enemies: [
      { name: 'Academy Ninja',   level: 15, atkMin: 24, atkMax: 38, hp: 280, spd: 55, critRate: 8  },
      { name: 'Chunin Trainee',  level: 15, atkMin: 28, atkMax: 42, hp: 260, spd: 62, critRate: 8  },
      { name: 'Leaf Genin',      level: 15, atkMin: 22, atkMax: 36, hp: 305, spd: 50, critRate: 8  },
      { name: 'Scroll Guardian', level: 15, atkMin: 30, atkMax: 46, hp: 248, spd: 68, critRate: 10 },
    ],
    exp: { win: 200, loss: 50  },
    ryo: { win: 200, loss: 50  },
  },
  normal: {
    label: 'Normal',
    emoji: '🟡',
    description: 'Seasoned chunin. A real challenge.',
    enemies: [
      { name: 'Sand Chunin',     level: 40, atkMin: 58, atkMax: 82, hp: 520,  spd: 80,  critRate: 10 },
      { name: 'Mist Swordsman',  level: 40, atkMin: 65, atkMax: 90, hp: 460,  spd: 95,  critRate: 12 },
      { name: 'Rain Ninja',      level: 40, atkMin: 55, atkMax: 78, hp: 580,  spd: 72,  critRate: 10 },
      { name: 'Rock Shinobi',    level: 40, atkMin: 60, atkMax: 85, hp: 540,  spd: 76,  critRate: 10 },
    ],
    exp: { win: 500, loss: 100 },
    ryo: { win: 400, loss: 100 },
  },
  hard: {
    label: 'Hard',
    emoji: '🟠',
    description: 'Elite jounin. Only the strong survive.',
    enemies: [
      { name: 'ANBU Operative',  level: 100, atkMin: 130, atkMax: 175, hp: 1400, spd: 130, critRate: 16 },
      { name: 'Sound Jounin',    level: 100, atkMin: 140, atkMax: 185, hp: 1250, spd: 145, critRate: 18 },
      { name: 'Cloud Jounin',    level: 100, atkMin: 125, atkMax: 165, hp: 1500, spd: 118, critRate: 14 },
      { name: 'Mist Jounin',     level: 100, atkMin: 148, atkMax: 192, hp: 1200, spd: 155, critRate: 20 },
    ],
    exp: { win: 1000, loss: 200 },
    ryo: { win: 800,  loss: 200 },
  },
  extreme: {
    label: 'Extreme',
    emoji: '🔴',
    description: 'Kage-level threats. Legendary difficulty.',
    enemies: [
      { name: 'Akatsuki Member', level: 200, atkMin: 310, atkMax: 400, hp: 4500, spd: 210, critRate: 24 },
      { name: 'Kage Bodyguard',  level: 200, atkMin: 290, atkMax: 380, hp: 5200, spd: 190, critRate: 20 },
      { name: 'Black Ops Elite', level: 200, atkMin: 330, atkMax: 420, hp: 4200, spd: 225, critRate: 26 },
      { name: 'Immortal Puppet', level: 200, atkMin: 280, atkMax: 365, hp: 5500, spd: 180, critRate: 18 },
    ],
    exp: { win: 2000, loss: 400  },
    ryo: { win: 1500, loss: 300  },
  },
};

// ── User Level System ─────────────────────────
/** EXP granted to the USER when they pull a new (non-duplicate) card, by rarity */
const USER_EXP_PER_RARITY = { D: 40, C: 75, B: 125, A: 175, S: 250, SS: 350, UR: 500 };
/** Flat EXP required to reach each next user level */
const USER_EXP_PER_LEVEL = 1000;

// ── Shop ──────────────────────────────────────
const SHOP_ITEMS = {
  ramen: {
    key: 'ramen', label: 'Ramen', price: 4000, dailyLimit: 3,
    dbLimitCol: 'shop_ramen_bought',
  },
  random_scroll: {
    key: 'random_scroll', label: 'Random Scroll', price: 3000, dailyLimit: 5,
    dbLimitCol: 'shop_random_bought',
  },
  exp_scroll: {
    key: 'exp_scroll', label: 'EXP Scroll', price: 5000, dailyLimit: 20,
    dbLimitCol: 'shop_exp_bought',
  },
  chakra: {
    key: 'chakra', label: 'Chakra Essence', price: 500, dailyLimit: 200,
    dbLimitCol: 'shop_chakra_bought',
  },
  trial_ticket: {
    key: 'trial_ticket', label: 'Trial Ticket', price: 1000, priceType: 'chakra', dailyLimit: 3,
    dbLimitCol: 'shop_ticket_bought',
  },
};

// ── Expedition Areas ──────────────────────────
// levelReq: minimum USER level to unlock this area
// duration: ms the expedition takes
// rewards: what's granted per expedition completion
const EXPEDITION_AREAS = {
  training_grounds: {
    key: 'training_grounds',
    name: 'Training Grounds',
    levelReq: 1,
    duration: 30 * 60 * 1000,           // 30 min
    rewards: { ryo: 500, exp_scrolls: 1 },
  },
  forest_of_death: {
    key: 'forest_of_death',
    name: 'Forest of Death',
    levelReq: 5,
    duration: 60 * 60 * 1000,           // 1 hr
    rewards: { ryo: 1200, chakra_essence: 40, exp_scrolls: 1 },
  },
  chunin_arena: {
    key: 'chunin_arena',
    name: 'Chunin Arena',
    levelReq: 10,
    duration: 2 * 60 * 60 * 1000,       // 2 hr
    rewards: { ryo: 2500, chakra_essence: 80, exp_scrolls: 2 },
  },
  valley_of_the_end: {
    key: 'valley_of_the_end',
    name: 'Valley of the End',
    levelReq: 20,
    duration: 4 * 60 * 60 * 1000,       // 4 hr
    rewards: { ryo: 5000, chakra_essence: 150, exp_scrolls: 3 },
  },
  hokage_mountain: {
    key: 'hokage_mountain',
    name: 'Hokage Mountain',
    levelReq: 30,
    duration: 8 * 60 * 60 * 1000,       // 8 hr
    rewards: { ryo: 10000, chakra_essence: 300, exp_scrolls: 5 },
  },
};

// ── EXP Formula ───────────────────────────────
/** EXP required to reach the NEXT level from `level` */
function expToNextLevel(level) {
  return 1000;
}

// ── Colors ────────────────────────────────────
const COLORS = {
  // ← Change EMBED_COLOR to restyle every general embed in the bot at once.
  // Card embeds (n pull, n ci, n mci) always use the card's rarity color instead.
  EMBED_COLOR: 0xE74C3C,  // red

  default:  0x1A1A2E,
  success:  0x2ECC71,
  error:    0xE74C3C,
  info:     0x3498DB,
  warning:  0xF39C12,
  prestige: 0xF1C40F,
  mastery:  0x9B59B6,
  arena:    0xE67E22,
  ramen:    0xE74C3C,
};

// ── Scroll Rewards (from src/data/scroll_rewards.json) ──
const SCROLL_REWARDS = {
  academy: {
    label: 'Academy Scroll',
    db_col: 'academy_scrolls',
    color: 11776947,
    rewards: {
      ryo: { label: 'Ryo', emoji: '<:ryo:1529490447381299230>', enabled: true, drop_chance: 1.0, min: 200, max: 600 },
      essence: { label: 'Chakra Essence', emoji: '<:essence:1529490380905644143>', enabled: true, drop_chance: 1.0, min: 10, max: 30 },
      ramen: { label: 'Ramen', emoji: '<:ramen:1529823076118691890>', enabled: false, drop_chance: 0.0, min: 1, max: 1 },
      exp_scrolls: { label: 'EXP Scrolls', emoji: '📜', enabled: true, drop_chance: 0.15, min: 1, max: 1 },
      fragments: { label: 'Fragments', emoji: '🃏', enabled: true, drop_chance: 0.60, min_drops: 1, max_drops: 1, rarity_pool: { D: 80, C: 20 } },
    },
  },
  chunin: {
    label: 'Chunin Mission Scroll',
    db_col: 'chunin_scrolls',
    color: 4704075,
    rewards: {
      ryo: { label: 'Ryo', emoji: '<:ryo:1529490447381299230>', enabled: true, drop_chance: 1.0, min: 500, max: 1200 },
      essence: { label: 'Chakra Essence', emoji: '<:essence:1529490380905644143>', enabled: true, drop_chance: 1.0, min: 25, max: 60 },
      ramen: { label: 'Ramen', emoji: '<:ramen:1529823076118691890>', enabled: false, drop_chance: 0.0, min: 1, max: 1 },
      exp_scrolls: { label: 'EXP Scrolls', emoji: '📜', enabled: true, drop_chance: 0.25, min: 1, max: 1 },
      fragments: { label: 'Fragments', emoji: '🃏', enabled: true, drop_chance: 0.70, min_drops: 1, max_drops: 1, rarity_pool: { C: 70, B: 30 } },
    },
  },
  mission: {
    label: 'Mission Scroll',
    db_col: 'mission_scrolls',
    color: 4172287,
    rewards: {
      ryo: { label: 'Ryo', emoji: '<:ryo:1529490447381299230>', enabled: true, drop_chance: 1.0, min: 1000, max: 2500 },
      essence: { label: 'Chakra Essence', emoji: '<:essence:1529490380905644143>', enabled: true, drop_chance: 1.0, min: 50, max: 100 },
      ramen: { label: 'Ramen', emoji: '<:ramen:1529823076118691890>', enabled: false, drop_chance: 0.0, min: 1, max: 1 },
      exp_scrolls: { label: 'EXP Scrolls', emoji: '📜', enabled: true, drop_chance: 0.35, min: 1, max: 2 },
      fragments: { label: 'Fragments', emoji: '🃏', enabled: true, drop_chance: 0.75, min_drops: 1, max_drops: 2, rarity_pool: { C: 40, B: 40, A: 20 } },
    },
  },
  jonin: {
    label: 'Jonin Mission Scroll',
    db_col: 'jonin_scrolls',
    color: 11030527,
    rewards: {
      ryo: { label: 'Ryo', emoji: '<:ryo:1529490447381299230>', enabled: true, drop_chance: 1.0, min: 2000, max: 4500 },
      essence: { label: 'Chakra Essence', emoji: '<:essence:1529490380905644143>', enabled: true, drop_chance: 1.0, min: 80, max: 150 },
      ramen: { label: 'Ramen', emoji: '<:ramen:1529823076118691890>', enabled: true, drop_chance: 0.10, min: 1, max: 1 },
      exp_scrolls: { label: 'EXP Scrolls', emoji: '📜', enabled: true, drop_chance: 0.50, min: 1, max: 2 },
      fragments: { label: 'Fragments', emoji: '🃏', enabled: true, drop_chance: 0.80, min_drops: 1, max_drops: 2, rarity_pool: { B: 45, A: 40, S: 15 } },
    },
  },
  anbu: {
    label: 'ANBU Classified Scroll',
    db_col: 'anbu_scrolls',
    color: 15158332,
    rewards: {
      ryo: { label: 'Ryo', emoji: '<:ryo:1529490447381299230>', enabled: true, drop_chance: 1.0, min: 4000, max: 8000 },
      essence: { label: 'Chakra Essence', emoji: '<:essence:1529490380905644143>', enabled: true, drop_chance: 1.0, min: 150, max: 300 },
      ramen: { label: 'Ramen', emoji: '<:ramen:1529823076118691890>', enabled: true, drop_chance: 0.30, min: 1, max: 1 },
      exp_scrolls: { label: 'EXP Scrolls', emoji: '📜', enabled: true, drop_chance: 0.65, min: 1, max: 3 },
      fragments: { label: 'Fragments', emoji: '🃏', enabled: true, drop_chance: 0.85, min_drops: 1, max_drops: 2, rarity_pool: { A: 60, S: 40 } },
    },
  },
  hokage: {
    label: 'Hokage Secret Scroll',
    db_col: 'hokage_scrolls',
    color: 16766720,
    rewards: {
      ryo: { label: 'Ryo', emoji: '<:ryo:1529490447381299230>', enabled: true, drop_chance: 1.0, min: 8000, max: 15000 },
      essence: { label: 'Chakra Essence', emoji: '<:essence:1529490380905644143>', enabled: true, drop_chance: 1.0, min: 250, max: 500 },
      ramen: { label: 'Ramen', emoji: '<:ramen:1529823076118691890>', enabled: true, drop_chance: 0.50, min: 1, max: 1 },
      exp_scrolls: { label: 'EXP Scrolls', emoji: '📜', enabled: true, drop_chance: 0.80, min: 2, max: 3 },
      fragments: { label: 'Fragments', emoji: '🃏', enabled: true, drop_chance: 0.90, min_drops: 1, max_drops: 3, rarity_pool: { A: 40, S: 60 } },
    },
  },
};

// ── Trial Tower Configs (from towerconfig/*.json) ──
const TOWER_CONFIGS = {
  academy: {
    name: 'Academy Trial',
    shortName: 'Academy',
    emoji: '📚',
    color: '#B3AA93',
    ticketCol: 'academy_trial_tickets',
    thumbnail: 'https://placehold.co/80x80/b3aa93/white?text=A',
    squadEnemyNames: ['Academy Ninja', 'Leaf Genin', 'Chunin Trainee', 'Scroll Guardian'],
    bossNames: {
      5: 'Iruka Sensei', 10: 'Konohamaru', 15: 'Rock Lee', 20: 'Kiba Inuzuka',
      25: 'Neji Hyuga', 30: 'Shikamaru Nara', 35: 'Hinata Hyuga', 40: 'Temari',
      45: 'Gaara of the Sand', 50: 'Tsunade', 55: 'Jiraiya', 60: 'Kakashi Hatake',
      65: 'Might Guy', 70: 'Yamato', 75: 'Orochimaru', 80: 'Itachi Uchiha',
      85: 'Kisame Hoshigaki', 90: 'Pain', 95: 'Madara Uchiha', 100: 'Kaguya Otsutsuki',
      default: 'Trial Boss',
    },
    floors: {
      1:   { squad: { hp: 300,   atkMin: 20,   atkMax: 32,   spd: 55,  critRate: 8  }, boss: { hp: 900,    atkMin: 28,   atkMax: 42,   spd: 50,  critRate: 10 } },
      25:  { squad: { hp: 1200,  atkMin: 90,   atkMax: 130,  spd: 85,  critRate: 10 }, boss: { hp: 4000,   atkMin: 125,  atkMax: 175,  spd: 80,  critRate: 12 } },
      50:  { squad: { hp: 4500,  atkMin: 280,  atkMax: 380,  spd: 118, critRate: 12 }, boss: { hp: 15000,  atkMin: 390,  atkMax: 520,  spd: 112, critRate: 14 } },
      75:  { squad: { hp: 16000, atkMin: 900,  atkMax: 1150, spd: 152, critRate: 15 }, boss: { hp: 54000,  atkMin: 1250, atkMax: 1600, spd: 145, critRate: 17 } },
      100: { squad: { hp: 55000, atkMin: 2800, atkMax: 3500, spd: 188, critRate: 18 }, boss: { hp: 185000, atkMin: 3900, atkMax: 4800, spd: 178, critRate: 22 } },
    },
    rewards: {
      1:   { ryo: 60,   chakra: 4,   exp: 0.05, academy_scrolls: 0.10, chunin_scrolls: 0.030, jonin_scrolls: 0.010, anbu_scrolls: 0.004 },
      25:  { ryo: 220,  chakra: 14,  exp: 0.07, academy_scrolls: 0.14, chunin_scrolls: 0.060, jonin_scrolls: 0.025, anbu_scrolls: 0.008 },
      50:  { ryo: 600,  chakra: 35,  exp: 0.09, ramen: 0.005, academy_scrolls: 0.20, chunin_scrolls: 0.100, jonin_scrolls: 0.045, anbu_scrolls: 0.015 },
      75:  { ryo: 1200, chakra: 70,  exp: 0.11, ramen: 0.010, academy_scrolls: 0.25, chunin_scrolls: 0.145, jonin_scrolls: 0.075, anbu_scrolls: 0.025 },
      100: { ryo: 2500, chakra: 120, exp: 0.14, ramen: 0.015, academy_scrolls: 0.30, chunin_scrolls: 0.190, jonin_scrolls: 0.115, anbu_scrolls: 0.040 },
    },
  },
  chunin: {
    name: 'Chunin Trial',
    shortName: 'Chunin',
    emoji: '🟦',
    color: '#3FA9FF',
    ticketCol: 'chunin_trial_tickets',
    thumbnail: 'https://placehold.co/80x80/3fa9ff/white?text=C',
    squadEnemyNames: ['Sand Chunin', 'Mist Swordsman', 'Rain Ninja', 'Rock Shinobi'],
    bossNames: {
      5: 'Haku', 10: 'Zabuza Momochi', 15: 'Dosu Kinuta', 20: 'Zaku Abumi',
      25: 'Gaara of the Sand', 30: 'Temari', 35: 'Kankuro', 40: 'Asuma Sarutobi',
      45: 'Kurenai Yuhi', 50: 'Kakashi Hatake', 55: 'Might Guy', 60: 'Jiraiya',
      65: 'Tsunade', 70: 'Orochimaru', 75: 'Itachi Uchiha', 80: 'Kisame Hoshigaki',
      85: 'Deidara', 90: 'Pain', 95: 'Obito Uchiha', 100: 'Madara Uchiha',
      default: 'Trial Boss',
    },
    floors: {
      1:   { squad: { hp: 600,   atkMin: 45,   atkMax: 65,   spd: 75,  critRate: 10 }, boss: { hp: 2000,   atkMin: 65,   atkMax: 90,   spd: 70,  critRate: 12 } },
      25:  { squad: { hp: 2800,  atkMin: 200,  atkMax: 270,  spd: 110, critRate: 12 }, boss: { hp: 9500,   atkMin: 280,  atkMax: 370,  spd: 105, critRate: 14 } },
      50:  { squad: { hp: 10000, atkMin: 620,  atkMax: 800,  spd: 145, critRate: 14 }, boss: { hp: 34000,  atkMin: 860,  atkMax: 1100, spd: 138, critRate: 16 } },
      75:  { squad: { hp: 35000, atkMin: 2000, atkMax: 2500, spd: 182, critRate: 17 }, boss: { hp: 118000, atkMin: 2750, atkMax: 3400, spd: 174, critRate: 19 } },
      100: { squad: { hp: 120000, atkMin: 6200, atkMax: 7800, spd: 220, critRate: 20 }, boss: { hp: 400000, atkMin: 8500, atkMax: 10500, spd: 210, critRate: 24 } },
    },
    rewards: {
      1:   { ryo: 120,  chakra: 8,   exp: 0.06, academy_scrolls: 0.10, chunin_scrolls: 0.080, jonin_scrolls: 0.025, anbu_scrolls: 0.008 },
      25:  { ryo: 450,  chakra: 28,  exp: 0.09, academy_scrolls: 0.12, chunin_scrolls: 0.130, jonin_scrolls: 0.055, anbu_scrolls: 0.016 },
      50:  { ryo: 1200, chakra: 70,  exp: 0.11, ramen: 0.008, academy_scrolls: 0.15, chunin_scrolls: 0.180, jonin_scrolls: 0.090, anbu_scrolls: 0.030 },
      75:  { ryo: 2500, chakra: 140, exp: 0.13, ramen: 0.015, academy_scrolls: 0.18, chunin_scrolls: 0.230, jonin_scrolls: 0.135, anbu_scrolls: 0.048 },
      100: { ryo: 5000, chakra: 250, exp: 0.17, ramen: 0.022, academy_scrolls: 0.20, chunin_scrolls: 0.280, jonin_scrolls: 0.185, anbu_scrolls: 0.070 },
    },
  },
  jonin: {
    name: 'Jonin Trial',
    shortName: 'Jonin',
    emoji: '🟧',
    color: '#F39C12',
    ticketCol: 'jonin_trial_tickets',
    thumbnail: 'https://placehold.co/80x80/f39c12/white?text=J',
    squadEnemyNames: ['ANBU Operative', 'Sound Jounin', 'Cloud Jounin', 'Mist Jounin'],
    bossNames: {
      5: 'Anko Mitarashi', 10: 'Yamato', 15: 'Asuma Sarutobi', 20: 'Kurenai Yuhi',
      25: 'Kakashi Hatake', 30: 'Might Guy', 35: 'Tsunade', 40: 'Jiraiya',
      45: 'Orochimaru', 50: 'Itachi Uchiha', 55: 'Kisame Hoshigaki', 60: 'Deidara',
      65: 'Sasori', 70: 'Konan', 75: 'Pain', 80: 'Obito Uchiha',
      85: 'Kabuto (Sage Mode)', 90: 'Madara Uchiha', 95: 'Kaguya Otsutsuki', 100: 'Sage of Six Paths',
      default: 'Trial Boss',
    },
    floors: {
      1:   { squad: { hp: 1500,  atkMin: 110,  atkMax: 150,  spd: 110, critRate: 12 }, boss: { hp: 5000,   atkMin: 155,  atkMax: 210,  spd: 105, critRate: 14 } },
      25:  { squad: { hp: 7000,  atkMin: 500,  atkMax: 650,  spd: 150, critRate: 14 }, boss: { hp: 24000,  atkMin: 700,  atkMax: 900,  spd: 143, critRate: 16 } },
      50:  { squad: { hp: 26000, atkMin: 1600, atkMax: 2050, spd: 190, critRate: 17 }, boss: { hp: 88000,  atkMin: 2200, atkMax: 2800, spd: 182, critRate: 19 } },
      75:  { squad: { hp: 90000, atkMin: 5000, atkMax: 6200, spd: 230, critRate: 20 }, boss: { hp: 300000, atkMin: 7000, atkMax: 8600, spd: 220, critRate: 22 } },
      100: { squad: { hp: 300000, atkMin: 15000, atkMax: 18500, spd: 270, critRate: 24 }, boss: { hp: 1000000, atkMin: 21000, atkMax: 26000, spd: 258, critRate: 28 } },
    },
    rewards: {
      1:   { ryo: 250,  chakra: 16,  exp: 0.07, academy_scrolls: 0.08, chunin_scrolls: 0.060, jonin_scrolls: 0.080, anbu_scrolls: 0.018 },
      25:  { ryo: 900,  chakra: 55,  exp: 0.10, academy_scrolls: 0.08, chunin_scrolls: 0.090, jonin_scrolls: 0.140, anbu_scrolls: 0.035 },
      50:  { ryo: 2500, chakra: 140, exp: 0.13, ramen: 0.010, academy_scrolls: 0.08, chunin_scrolls: 0.120, jonin_scrolls: 0.200, anbu_scrolls: 0.060 },
      75:  { ryo: 5500, chakra: 280, exp: 0.16, ramen: 0.020, academy_scrolls: 0.08, chunin_scrolls: 0.150, jonin_scrolls: 0.260, anbu_scrolls: 0.092 },
      100: { ryo: 11000, chakra: 500, exp: 0.20, ramen: 0.030, academy_scrolls: 0.08, chunin_scrolls: 0.180, jonin_scrolls: 0.320, anbu_scrolls: 0.130 },
    },
  },
  anbu: {
    name: 'ANBU Trial',
    shortName: 'ANBU',
    emoji: '🔴',
    color: '#E74C3C',
    ticketCol: 'anbu_trial_tickets',
    thumbnail: 'https://placehold.co/80x80/e74c3c/white?text=S',
    squadEnemyNames: ['Akatsuki Agent', 'Black Ops Elite', 'Root Operative', 'Shadow Hunter'],
    bossNames: {
      5: 'Itachi Uchiha', 10: 'Kisame Hoshigaki', 15: 'Deidara', 20: 'Sasori',
      25: 'Hidan', 30: 'Kakuzu', 35: 'Konan', 40: 'Pain',
      45: 'Obito Uchiha', 50: 'Kabuto (Sage Mode)', 55: 'Edo Itachi', 60: 'Edo Nagato',
      65: 'Madara Uchiha', 70: 'Ten-Tails Jinchuriki', 75: 'Kaguya Otsutsuki', 80: 'Hamura Otsutsuki',
      85: 'Hagoromo Otsutsuki', 90: 'Isshiki Otsutsuki', 95: 'Baryon Naruto', 100: 'Sage of Six Paths (True Form)',
      default: 'Trial Boss',
    },
    floors: {
      1:   { squad: { hp: 4000,  atkMin: 300,  atkMax: 400,  spd: 160, critRate: 16 }, boss: { hp: 14000,  atkMin: 420,  atkMax: 560,  spd: 152, critRate: 18 } },
      25:  { squad: { hp: 18000, atkMin: 1300, atkMax: 1700, spd: 210, critRate: 18 }, boss: { hp: 62000,  atkMin: 1850, atkMax: 2350, spd: 200, critRate: 20 } },
      50:  { squad: { hp: 70000, atkMin: 4200, atkMax: 5200, spd: 262, critRate: 22 }, boss: { hp: 235000, atkMin: 5800, atkMax: 7200, spd: 250, critRate: 24 } },
      75:  { squad: { hp: 250000, atkMin: 13000, atkMax: 16000, spd: 315, critRate: 26 }, boss: { hp: 840000, atkMin: 18000, atkMax: 22000, spd: 300, critRate: 28 } },
      100: { squad: { hp: 900000, atkMin: 40000, atkMax: 50000, spd: 370, critRate: 30 }, boss: { hp: 3000000, atkMin: 55000, atkMax: 68000, spd: 352, critRate: 34 } },
    },
    rewards: {
      1:   { ryo: 500,  chakra: 35,  exp: 0.08, academy_scrolls: 0.05, chunin_scrolls: 0.040, jonin_scrolls: 0.060, anbu_scrolls: 0.080 },
      25:  { ryo: 2000, chakra: 120, exp: 0.12, academy_scrolls: 0.05, chunin_scrolls: 0.050, jonin_scrolls: 0.100, anbu_scrolls: 0.160 },
      50:  { ryo: 6000, chakra: 300, exp: 0.16, ramen: 0.015, academy_scrolls: 0.05, chunin_scrolls: 0.065, jonin_scrolls: 0.150, anbu_scrolls: 0.260 },
      75:  { ryo: 14000, chakra: 650, exp: 0.21, ramen: 0.030, academy_scrolls: 0.05, chunin_scrolls: 0.080, jonin_scrolls: 0.200, anbu_scrolls: 0.380 },
      100: { ryo: 30000, chakra: 1200, exp: 0.28, ramen: 0.050, academy_scrolls: 0.05, chunin_scrolls: 0.095, jonin_scrolls: 0.255, anbu_scrolls: 0.520 },
    },
  },
};

module.exports = {
  ARROW_EMOJI, LVLOP_EMOJI, WALLET_EMOJI,
  PREFIXES,
  E, COMBAT_EMOJIS, RARITIES, PULL_POOL_RARITIES,
  MASTERY, MASTERY_UPGRADE_COST,
  MAX_STARS, PRESTIGE_COSTS, PRESTIGE_STAT_BONUS,
  PULLS_PER_PERIOD, PULL_COOLDOWN_MS,
  STARTING_RAMEN, STARTING_RYO,
  ARENA_ATTEMPTS_PER_DAY, ARENA_DIFFICULTIES,
  DAILY_REWARDS, ESSENCE_PER_DUP,
  expToNextLevel,
  COLORS,
  USER_EXP_PER_RARITY, USER_EXP_PER_LEVEL,
  SHOP_ITEMS,
  EXPEDITION_AREAS,
  SCROLL_EMOJIS,
  HP_BAR,
  SCROLL_REWARDS,
  TOWER_CONFIGS,
};
