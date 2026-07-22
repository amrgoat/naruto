---
name: Naruto Bot Architecture
description: Key decisions and non-obvious behaviors for the Naruto Discord bot built Jul 2026
---

## Pull Reset System
Resets happen at **12:00 AM IST** and **12:00 PM IST** (twice daily). IST = UTC+5:30.
`currentPullPeriodStartUTC()` in `timeUtils.js` computes the UTC ms of the current period start.
`pulls_reset_at` in the DB stores the period start timestamp; if `user.pulls_reset_at < periodStart`, a reset is due.
`ramen` restores pulls without touching `pulls_reset_at` — natural resets still apply after ramen.

**Why:** Dual-reset day was a core spec requirement; the IST offset math is tricky to redo from scratch.

## Prestige Resets Level AND Mastery
`N prestige` resets the card to **Level 1, Mastery 1** (unlike mastery upgrades which do not reset level).
Stars are preserved. Each star = +20% to ATK/HP/SPD, additive (not multiplicative).

**Why:** Spec explicitly says "Prestiging resets the card to Level 1, Mastery 1."

## Mastery Does NOT Reset Level
`N mastery` upgrades only increase the level cap; the card stays at whatever level it reached.
Only prestige resets the level.

## SS and UR Are Locked
`PULL_POOL_RARITIES` is filtered to only unlocked rarities with pullWeight > 0.
SS/UR exist in `RARITIES` config with `pullWeight: 0` and `locked: true` for future use.

## Attack Damage Ranges
Each character has `baseAtkMin`, `baseAtkMax`, `atkGrowth` (both min and max grow by this per level).
Battle rolls `Math.floor(Math.random() * (max - min + 1)) + min` then applies 1.5× for crits.
Display: `formatAtk()` → `"55–80"` format.

## Character Images
Currently use `placehold.co` colored placeholders. Replace `char.image` in `src/data/characters.js` with real CDN URLs when available.

## Database Reset
If schema changes are needed: delete `data.db` at repo root and restart — schema auto-creates on boot.
Old `data.db` from previous bot version caused `no such column` errors.

## Arena is AI-Only
No PvP leaderboard. `ARENA_DIFFICULTIES` in config.js defines 4 tiers with hardcoded enemy stats.
10 attempts/day reset at 12:00 AM IST (once daily, not twice like pulls).
