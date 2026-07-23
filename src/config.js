// ─────────────────────────────────────────────
//  config.js  —  Global constants & game tuning
// ─────────────────────────────────────────────

/** All command prefixes that the bot responds to */
const PREFIXES = ['N', 'N ', 'n ', 'ｎ'];
const PULL_PREFIXES = ['Npull', 'Ｎpull', 'npull', 'ｎpull']; // No-space pull aliases

// ── Emojis ────────────────────────────────────
const E = {
  ryo:      '💴',
  ramen:    '🍜',
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
  D:  { label: 'D-Rank',  emoji: '⬛', color: 0xB0B0B0, pullWeight: 40, locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820114110288033/d.png?ex=6a5fb02f&is=6a5e5eaf&hm=8210d61deadbe0165a3543b43116c15e82602f8e8628409636ff82e7bcaa2d6c&' },
  C:  { label: 'C-Rank',  emoji: '⬜', color: 0x47C74B, pullWeight: 30, locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820113623486564/c.png?ex=6a5fb02f&is=6a5e5eaf&hm=8ecc0eaa5032989e913939f5dd88c7e30782f99bcb3a6aff66a7f734d13228e6&' },
  B:  { label: 'B-Rank',  emoji: '🟩', color: 0x3FA9FF, pullWeight: 20, locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820113279815882/b.png?ex=6a5fb02f&is=6a5e5eaf&hm=d02efdc2ad0df3816aaf357a1cb2923dd604b0f2aa99ca47233dfc5b60d51143&' },
  A:  { label: 'A-Rank',  emoji: '🟦', color: 0xA85FFF, pullWeight: 8,  locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820112864579677/a.png?ex=6a5fb02f&is=6a5e5eaf&hm=8bc34eb624830a6394fdffe54128b2a175966b1ac209c3bb64777e24d677c94b&' },
  S:  { label: 'S-Rank',  emoji: '🟪', color: 0xFFC82E, pullWeight: 2,  locked: false,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820114592628937/s.png?ex=6a5fb02f&is=6a5e5eaf&hm=c6ad8ba10a094c7d5ea7ed1de5f38be9c3896eaed50e446b6610ddd7a723ba12&' },
  SS: { label: 'SS-Rank', emoji: '🟨', color: 0xF44336, pullWeight: 0,  locked: true,
        thumb: 'https://cdn.discordapp.com/attachments/1528819900402106378/1528820115024511056/ss.png?ex=6a5fb02f&is=6a5e5eaf&hm=9c255f07266b0af975b5d8629ecd6b045a8bd1bb48a05d3521957781187be5d1&' },
  UR: { label: 'UR',      emoji: '🔴', color: 0xFFF7EC, pullWeight: 0,  locked: true,
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
const STARTING_RYO     = 0;

// ── Arena ─────────────────────────────────────
const ARENA_ATTEMPTS_PER_DAY = 10;

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

// ── EXP Formula ───────────────────────────────
/** EXP required to reach the NEXT level from `level` */
function expToNextLevel(level) {
  return level * 100;
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

module.exports = {
  PREFIXES, PULL_PREFIXES,
  E, COMBAT_EMOJIS, RARITIES, PULL_POOL_RARITIES,
  MASTERY, MASTERY_UPGRADE_COST,
  MAX_STARS, PRESTIGE_COSTS, PRESTIGE_STAT_BONUS,
  PULLS_PER_PERIOD, PULL_COOLDOWN_MS,
  STARTING_RAMEN, STARTING_RYO,
  ARENA_ATTEMPTS_PER_DAY, ARENA_DIFFICULTIES,
  DAILY_REWARDS, ESSENCE_PER_DUP,
  expToNextLevel,
  COLORS,
};
