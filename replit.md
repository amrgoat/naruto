# Naruto Discord Bot

A Naruto-themed Discord bot with card collection, battles, arena, missions, and a trial tower system.

## Stack

- **Runtime**: Node.js
- **Database**: SQLite via `node-sqlite3-wasm`
- **Discord**: `discord.js` v14

## How to run

1. Add the required secrets in the **Secrets** tab:
   - `DISCORD_TOKEN` — bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
   - `BACKUP_CHANNEL_ID` — channel ID where the bot posts database backups (right-click channel → Copy ID; requires Developer Mode)
2. Start the **Naruto Bot** workflow

## Command prefix

`n` or `N` (e.g. `n pull`, `n arena`, `n daily`)

## Key commands

| Command | Description |
|---|---|
| `n pull` | Pull new character cards |
| `n daily` | Claim daily rewards |
| `n arena` | Battle arena enemies |
| `n trial` | Trial tower floors |
| `n profile` | View your profile |
| `n team` | Manage your battle team |
| `n shop` | Buy items |
| `n mission` | Run missions |
| `n expedition` | Send team on expeditions |

## User preferences

(none yet)
