// ─────────────────────────────────────────────
//  index.js  —  Entry point & message router
// ─────────────────────────────────────────────

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const http = require('http');
const { PREFIXES }   = require('./config');
const { sendBackup } = require('./utils/backup');

const BACKUP_INTERVAL_MS = 1 * 60 * 60 * 1000; // every 1 hour

// ── Keep-alive web server ──────────────────────
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Naruto Bot is online.');
}).listen(5000, () => {
  console.log('  🌐 Keep-alive server running on port 5000');
});

// ── Discord client ─────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  // Never ping the user on replies by default
  allowedMentions: { repliedUser: false },
});

// ── Universal cooldown (3 seconds per user) ────
const cooldowns = new Map(); // userId -> lastCommandTimestamp
const UNIVERSAL_COOLDOWN_MS = 3000;

// ── Load commands ──────────────────────────────
client.commands = new Collection();

function loadCommandDir(dir, tag = '') {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(dir, file));
    client.commands.set(cmd.name, cmd);
    console.log(`  ✓ Loaded command: ${tag}${cmd.name}`);
  }
}

loadCommandDir(path.join(__dirname, 'commands'));
loadCommandDir(path.join(__dirname, 'commands', 'admin'),   '[admin] ');
loadCommandDir(path.join(__dirname, 'commands', 'premium'), '[premium] ');

// ── Prefix parser ──────────────────────────────
/**
 * Parses a raw message content string into { command, args } or null.
 *
 * Supported forms:
 *   N pull, n pull, Ｎ pull, ｎ pull   (prefix + space + command)
 *   Npull, npull, nhelp, etc.          (no-space — all commands)
 */
function parseMessage(content) {
  // Spaced prefixes — try these first so "N help" works
  const spacedPrefixes = ['N ', 'Ｎ ', 'n ', 'ｎ '];
  for (const p of spacedPrefixes) {
    if (content.startsWith(p)) {
      const rest = content.slice(p.length).trim();
      if (!rest) return null;
      const [cmd, ...args] = rest.split(/\s+/);
      return { command: cmd.toLowerCase(), args };
    }
  }

  // No-space prefixes — "Nhelp", "npull", "nDaily", etc.
  const noSpacePrefixes = ['N', 'Ｎ', 'n', 'ｎ'];
  for (const p of noSpacePrefixes) {
    if (content.startsWith(p) && content.length > p.length) {
      const rest = content.slice(p.length);
      if (!rest || !/^[a-zA-Z]/.test(rest)) continue;
      const [cmd, ...args] = rest.trim().split(/\s+/);
      return { command: cmd.toLowerCase(), args };
    }
  }

  return null;
}

// ── Ready ──────────────────────────────────────
client.once('clientReady', () => {
  console.log(`\n${require('./config').E.leaf} ${client.user.tag} is online!`);
  console.log(`   Prefix  : N`);
  console.log(`   Servers : ${client.guilds.cache.size}`);
  console.log(`   Commands: ${client.commands.size}`);

  // Send a startup backup, then schedule one every 6 hours
  sendBackup(client, 'Startup');
  setInterval(() => sendBackup(client, 'Auto'), BACKUP_INTERVAL_MS);
});

// ── Message handler ────────────────────────────
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild)     return;

  const parsed = parseMessage(message.content);
  if (!parsed) return;

  const { command, args } = parsed;
  const cmd = client.commands.get(command);
  if (!cmd) return;

  const userId = message.author.id;
  const now    = Date.now();

  // ── Universal 3-second cooldown ────────────
  const lastUsed = cooldowns.get(userId) ?? 0;
  const sinceLast = now - lastUsed;
  if (sinceLast < UNIVERSAL_COOLDOWN_MS) {
    const remaining = UNIVERSAL_COOLDOWN_MS - sinceLast;
    const timeStr = remaining < 1000 ? '**a second**' : `**${(remaining / 1000).toFixed(1)}s**`;
    return message.reply({
      content: `This command is under cooldown for ${timeStr}`,
      allowedMentions: { repliedUser: false },
    });
  }
  cooldowns.set(userId, now);

  try {
    await cmd.execute(message, args, client);
  } catch (err) {
    console.error(`[${cmd.name}] Error:`, err);
    try {
      await message.reply({
        embeds: [require('./utils/embeds').errorEmbed(
          'Something went wrong. Please try again.'
        )],
        allowedMentions: { repliedUser: false },
      });
    } catch { /* swallow */ }
  }
});

// ── Login ──────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
