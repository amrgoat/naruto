// ─────────────────────────────────────────────
//  backup.js  —  SQLite database backup utility
//  Sends data.db as a Discord attachment to the
//  configured BACKUP_CHANNEL_ID every 6 hours,
//  and on bot startup.
// ─────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data.db');

/**
 * Send a backup of data.db to the backup channel.
 * @param {import('discord.js').Client} client
 * @param {string} reason  — label shown in the message (e.g. "Auto" / "Manual")
 */
async function sendBackup(client, reason = 'Auto') {
  const channelId = process.env.BACKUP_CHANNEL_ID;
  if (!channelId) {
    console.warn('[Backup] BACKUP_CHANNEL_ID not set — skipping backup.');
    return;
  }

  if (!fs.existsSync(DB_PATH)) {
    console.warn('[Backup] data.db not found — skipping backup.');
    return;
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    console.warn(`[Backup] Could not find channel ${channelId} — skipping backup.`);
    return;
  }

  const now       = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const sizeMB    = (fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(3);

  try {
    await channel.send({
      content: `📦 **[${reason} Backup]** \`${timestamp}\`  ·  \`${sizeMB} MB\`\nDownload and keep this file safe to restore player data if needed.`,
      files: [{ attachment: DB_PATH, name: `naruto-bot-backup-${now.toISOString().slice(0, 10)}.db` }],
    });
    console.log(`[Backup] ✅ ${reason} backup sent (${sizeMB} MB)`);
  } catch (err) {
    console.error('[Backup] ❌ Failed to send backup:', err.message);
  }
}

module.exports = { sendBackup };
