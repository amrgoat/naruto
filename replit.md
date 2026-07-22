# Naruto Discord Bot

A fully-featured Naruto-themed Discord bot built with **discord.js v14** and **better-sqlite3**.

## Architecture

```
src/
├── index.js              — Entry point, multi-prefix parser, command router
├── config.js             — Constants: emojis, rarities, mastery, arena, prestige
├── database.js           — SQLite schema + all prepared statements + giveExpToCard()
├── data/
│   └── characters.js     — 19 Classic Naruto characters (C–S rarity) + PULL_POOL
├── commands/
│   ├── start.js          — Register account
│   ├── profile.js        — View ninja profile
│   ├── pull.js           — Summon cards (12 pulls per period, 12 AM / 12 PM IST reset)
│   ├── ramen.js          — Use 1 Ramen to restore 12 pulls
│   ├── cards.js          — Paginated collection browser
│   ├── card.js           — Detailed card view by character name
│   ├── team.js           — Build/view 4-card team
│   ├── mastery.js        — Upgrade mastery (M1→M2→M3)
│   ├── prestige.js       — Earn stars (resets card to L1 M1, adds +20% per star)
│   ├── arena.js          — Fight AI teams (Easy/Normal/Hard/Extreme), 10 attempts/day
│   ├── battle.js         — Friendly PvP (no rewards)
│   ├── help.js           — Plain text command list
│   └── ping.js           — Latency check
└── utils/
    ├── timeUtils.js      — IST (UTC+5:30) reset helpers
    ├── cardUtils.js      — Stat calculations, formatAtk, starsDisplay, rarityBadge
    ├── battleEngine.js   — simulateBattle() with damage ranges and crit rolls
    ├── embeds.js         — buildPullEmbed(), buildCardEmbed(), error/success/infoEmbed()
    └── guards.js         — checkRegistered() middleware
```

## Key Systems

### Prefix Aliases
`N `, `Ｎ `, `n `, `ｎ ` + `Npull` / `npull` / `Ｎpull` / `ｎpull`

### Pull System
- **12 pulls per period** — resets at **12:00 AM IST** and **12:00 PM IST**
- 3-second cooldown between pulls
- Duplicates → **+1 Fragment** to the existing card (no new card created)
- Available rarities: **C (45%) · B (30%) · A (15%) · S (10%)**
- SS and UR are locked (0% weight) until a future update

### Rarity System
| Rarity | Emoji | Pull Weight |
|--------|-------|-------------|
| C-Rank | ⬜ | 45% |
| B-Rank | 🟩 | 30% |
| A-Rank | 🟦 | 15% |
| S-Rank | 🟪 | 10% |
| SS-Rank | 🟨 | 🔒 Locked |
| UR | 🔴 | 🔒 Locked |

### Mastery
- **M1** (Level cap 100) → 15 Fragments → **M2** (cap 200) → 25 Fragments → **M3** (cap 250)
- Level does NOT reset on mastery upgrade — cap just increases

### Prestige
- Requires: **Level 250 + M3**
- Costs: ⭐1=10, ⭐2=20, ⭐3=30, ⭐4=40, ⭐5=50 Fragments
- **Resets card to Level 1, Mastery 1**
- Each star adds **+20% ATK, HP, SPD** (additive, e.g. 3⭐ = +60%)

### Arena
- AI opponents — difficulty: Easy / Normal / Hard / Extreme
- **10 attempts per day** (resets at 12:00 AM IST)
- Win or loss both consume 1 attempt
- All team cards earn EXP; Ryo awarded to player

### Characters (19 total)
- **C (5):** Konohamaru, Kiba, Shino, Hinata, Ino
- **B (5):** Rock Lee (speed god), Choji (health wall), Tenten, Neji, Sakura
- **A (5):** Naruto (balanced), Sasuke (high ATK+crit), Shikamaru, Gaara (HP wall), Temari
- **S (4):** Kakashi, Jiraiya, Tsunade, Itachi (highest crit)

### Character Images
Images use `placehold.co` colored placeholders by default. Replace `char.image` URLs in `src/data/characters.js` with real artwork CDN URLs to upgrade visuals.

## Database
SQLite (`data.db`) — three tables:
- `users` — currency, pull tracking, arena attempts
- `cards` — owned cards with level/exp/mastery/stars/fragments
- `teams` — up to 4 cards per user (slot 1–4)

## User Preferences
- Prefix: `N` (and aliases listed above)
- All characters are Classic Naruto (no Shippuden forms)
- Attack uses a damage range: `atkMin–atkMax` displayed as e.g. `55–80`
- No Defense stat
- Team max: 4 cards
- SS and UR locked for launch version
