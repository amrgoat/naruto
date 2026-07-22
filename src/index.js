// ─────────────────────────────────────────────
//  index.js  —  Entry point & message router
// ─────────────────────────────────────────────

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const { PREFIXES, PULL_PREFIXES } = require('./config');

// ── Discord client ─────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Load commands ──────────────────────────────
client.commands = new Collection();
const commandsDir = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const cmd = require(path.join(commandsDir, file));
  client.commands.set(cmd.name, cmd);
  console.log(`  ✓ Loaded command: ${cmd.name}`);
}

// ── Prefix parser ──────────────────────────────
/**
 * Parses a raw message content string into { command, args } or null.
 *
 * Supported forms (all case-handled by PREFIXES/PULL_PREFIXES):
 *   N pull, N pull, n pull, n pull   (general: prefix + command)
 *   Npull, N pull, npull, n pull     (direct pull aliases)
 */
function parseMessage(content) {
  // Direct pull aliases first (Npull, npull, Ｎpull, ｎpull)
  for (const p of PULL_PREFIXES) {
    if (content.toLowerCase().startsWith(p.toLowerCase())) {
      const rest = content.slice(p.length).trim();
      return { command: 'pull', args: rest ? rest.split(/\s+/) : [] };
    }
  }

  // General prefix aliases (N , n , Ｎ , ｎ )
  for (const p of PREFIXES) {
    if (content.startsWith(p)) {
      const rest = content.slice(p.length).trim();
      if (!rest) return null;
      const [cmd, ...args] = rest.split(/\s+/);
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
});

// ── Message handler ────────────────────────────
client.on('messageCreate', async message => {
  // Ignore bots and DMs
  if (message.author.bot) return;
  if (!message.guild)     return;

  const parsed = parseMessage(message.content);
  if (!parsed) return;

  const { command, args } = parsed;
  const cmd = client.commands.get(command);
  if (!cmd) return;

  try {
    await cmd.execute(message, args, client);
  } catch (err) {
    console.error(`[${cmd.name}] Error:`, err);
    try {
      await message.reply({
        embeds: [require('./utils/embeds').errorEmbed(
          'Something went wrong. Please try again.'
        )],
      });
    } catch { /* swallow */ }
  }
});

// ── Login ──────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
