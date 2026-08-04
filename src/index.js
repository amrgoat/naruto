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
  if (req.url === '/preview') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scroll Embed Preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #313338;
    font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    padding: 32px 24px;
    min-height: 100vh;
    display: flex;
    gap: 40px;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
  }
  .column {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 340px;
    max-width: 420px;
  }
  .label {
    color: #949ba4;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .message {
    display: flex;
    gap: 16px;
    padding: 4px 0;
  }
  .avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6b35, #e74c3c);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .msg-body { flex: 1; }
  .username {
    color: #c9cdfb;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .username span { color: #949ba4; font-size: 12px; font-weight: 400; margin-left: 6px; }
  .embed {
    border-radius: 4px;
    border-left: 4px solid;
    background: #2b2d31;
    padding: 12px 16px;
    max-width: 420px;
    margin-top: 4px;
  }
  .embed-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.3;
  }
  .embed-desc {
    color: #dbdee1;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  .embed-desc b { color: #ffffff; font-weight: 600; }
  .embed-footer {
    color: #80848e;
    font-size: 12px;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #3f4147;
  }
  .divider { color: #4f545c; }
</style>
</head>
<body>

<!-- ── Column 1: Opening animation ── -->
<div class="column">
  <div class="label">Step 1 — Opening animation</div>
  <div class="message">
    <div class="avatar">🍃</div>
    <div class="msg-body">
      <div class="username">Naruto Bot <span>Today at 12:00 PM</span></div>

      <!-- Academy -->
      <div class="embed" style="border-color:#b3aa93;">
        <div class="embed-title">Opening Scrolls...</div>
        <div class="embed-desc">Opening <b>1</b> Academy Scroll

Please wait...</div>
      </div>

      <!-- Mission -->
      <div class="embed" style="border-color:#3FA9FF; margin-top:12px;">
        <div class="embed-title">Opening Scrolls...</div>
        <div class="embed-desc">Opening <b>5</b> Mission Scrolls

Please wait...</div>
      </div>

      <!-- Hokage -->
      <div class="embed" style="border-color:#FFD700; margin-top:12px;">
        <div class="embed-title">Opening Scrolls...</div>
        <div class="embed-desc">Opening <b>3</b> Hokage Secret Scrolls

Please wait...</div>
      </div>
    </div>
  </div>
</div>

<!-- ── Column 2: Reward embeds ── -->
<div class="column">
  <div class="label">Step 2 — Reward reveal</div>
  <div class="message">
    <div class="avatar">🍃</div>
    <div class="msg-body">
      <div class="username">Naruto Bot <span>Today at 12:00 PM</span></div>

      <!-- Academy reward -->
      <div class="embed" style="border-color:#b3aa93;">
        <div class="embed-title">Academy Scroll — Opened Successfully</div>
        <div class="embed-desc">Opened <b>1</b> Academy Scroll

━━━━━━━━━━━━━━━━━━━━━━
<b>Rewards</b>
🪙 <b>+420</b> Ryo
✨ <b>+18</b> Chakra Essence
🃏 <b>Konohamaru Fragment</b></div>
        <div class="embed-footer">Rewards have been added to your inventory.</div>
      </div>

      <!-- Mission reward -->
      <div class="embed" style="border-color:#3FA9FF; margin-top:12px;">
        <div class="embed-title">Mission Scroll — Opened Successfully</div>
        <div class="embed-desc">Opened <b>5</b> Mission Scrolls

━━━━━━━━━━━━━━━━━━━━━━
<b>Rewards</b>
🪙 <b>+8,350</b> Ryo
✨ <b>+312</b> Chakra Essence
📜 <b>+3</b> EXP Scrolls

🃏 <b>Naruto Uzumaki Fragment</b>
🃏 <b>Kiba Inuzuka Fragment</b>
🃏 <b>Naruto Uzumaki Fragment</b>
🃏 <b>Shikamaru Nara Fragment</b>
🃏 <b>Kakashi Hatake Fragment</b></div>
        <div class="embed-footer">Rewards have been added to your inventory.</div>
      </div>

      <!-- Hokage reward -->
      <div class="embed" style="border-color:#FFD700; margin-top:12px;">
        <div class="embed-title">Hokage Secret Scroll — Opened Successfully</div>
        <div class="embed-desc">Opened <b>3</b> Hokage Secret Scrolls

━━━━━━━━━━━━━━━━━━━━━━
<b>Rewards</b>
🪙 <b>+31,540</b> Ryo
✨ <b>+1,092</b> Chakra Essence
🍜 <b>+1</b> Ramen
📜 <b>+7</b> EXP Scrolls

🃏 <b>Itachi Uchiha Fragment</b>
🃏 <b>Gaara of the Sand Fragment</b>
🃏 <b>Tsunade Fragment</b>
🃏 <b>Itachi Uchiha Fragment</b>
🃏 <b>Orochimaru Fragment</b></div>
        <div class="embed-footer">Rewards have been added to your inventory.</div>
      </div>

    </div>
  </div>
</div>

</body>
</html>`);
    return;
  }
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

// ── Per-command cooldown (3 seconds per user per command) ──
const cooldowns = new Map(); // `${userId}:${command}` -> lastCommandTimestamp
const UNIVERSAL_COOLDOWN_MS = 3000;

// ── Load commands ──────────────────────────────
client.commands = new Collection();

function loadCommandDir(dir, tag = '') {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(dir, file));
    client.commands.set(cmd.name, cmd);
    if (Array.isArray(cmd.aliases)) {
      for (const alias of cmd.aliases) {
        client.commands.set(alias, cmd);
      }
    }
    const aliasStr = cmd.aliases?.length ? ` [${cmd.aliases.join(', ')}]` : '';
    console.log(`  ✓ Loaded command: ${tag}${cmd.name}${aliasStr}`);
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
 *   n pull, n pull (prefix + space + command)
 *   npull, nhelp, etc.                (no-space — all commands)
 */
function parseMessage(content) {
  // Spaced prefixes — try these first so "n help" works
  const spacedPrefixes = PREFIXES.filter(p => p.endsWith(' '));
  for (const p of spacedPrefixes) {
    if (content.startsWith(p)) {
      const rest = content.slice(p.length).trim();
      if (!rest) return null;
      const [cmd, ...args] = rest.split(/\s+/);
      return { command: cmd.toLowerCase(), args };
    }
  }

  // No-space prefixes — e.g. "tpull"
  const noSpacePrefixes = PREFIXES.filter(p => !p.endsWith(' '));
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
  console.log(`   Prefix  : ${PREFIXES[0].trim()}`);
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

  const userId   = message.author.id;
  const now      = Date.now();
  const cdKey    = `${userId}:${command}`;

  // ── Per-command 3-second cooldown ──────────
  const lastUsed  = cooldowns.get(cdKey) ?? 0;
  const sinceLast = now - lastUsed;
  if (sinceLast < UNIVERSAL_COOLDOWN_MS) {
    const remaining = UNIVERSAL_COOLDOWN_MS - sinceLast;
    const timeStr = remaining < 1000 ? '**a second**' : `**${(remaining / 1000).toFixed(1)}s**`;
    return message.reply({
      content: `This command is under cooldown for ${timeStr}`,
      allowedMentions: { repliedUser: false },
    });
  }
  cooldowns.set(cdKey, now);

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
