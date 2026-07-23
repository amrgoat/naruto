// ─────────────────────────────────────────────
//  premium/mp.js  —  N mp  (Mass Pull)
//  Uses all remaining pull attempts at once.
//  Premium (Jinchūriki) only.
// ─────────────────────────────────────────────

const { EmbedBuilder }   = require('discord.js');
const { q }              = require('../../database');
const { CHARACTERS, PULL_POOL } = require('../../data/characters');
const {
  RARITIES, PULL_POOL_RARITIES, ESSENCE_PER_DUP,
} = require('../../config');
const { checkRegistered }  = require('../../utils/guards');
const { errorEmbed }       = require('../../utils/embeds');
const { currentPullPeriodStartUTC, nextPullResetUTC, formatCountdown } = require('../../utils/timeUtils');

// ── Weighted random rarity roll ────────────────
function rollRarity() {
  const total = PULL_POOL_RARITIES.reduce((s, r) => s + RARITIES[r].pullWeight, 0);
  let roll    = Math.random() * total;
  for (const rarity of PULL_POOL_RARITIES) {
    roll -= RARITIES[rarity].pullWeight;
    if (roll <= 0) return rarity;
  }
  return PULL_POOL_RARITIES[PULL_POOL_RARITIES.length - 1];
}

function pickCharacter(rarity) {
  const pool = PULL_POOL[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Check if a user currently has active premium */
function hasPremium(user) {
  if (!user.is_premium) return false;
  if (user.premium_expires_at === 0) return true;   // permanent
  return user.premium_expires_at > Date.now();
}

module.exports = {
  name: 'mp',
  description: 'Mass Pull — use all remaining pulls at once · Premium only',

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // ── Premium check ──────────────────────────
    if (!hasPremium(user)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(0x9B59B6)
          .setDescription('Only **Jinchūriki** can use this command.')],
      });
    }

    const now         = Date.now();
    const periodStart = currentPullPeriodStartUTC(now);

    // ── Period reset ───────────────────────────
    let freshUser = user;
    if (freshUser.pulls_reset_at < periodStart) {
      q.resetPulls.run(periodStart, userId);
      freshUser = q.getUser.get(userId);
    }

    const pullsToUse = freshUser.pulls_remaining;

    if (pullsToUse <= 0) {
      const nextReset = nextPullResetUTC(now);
      return message.reply({
        embeds: [errorEmbed(
          `You have no pulls remaining.\n` +
          `Next reset in **${formatCountdown(nextReset - now)}**.`
        )],
      });
    }

    // ── Execute all pulls ──────────────────────
    const results = [];

    for (let i = 0; i < pullsToUse; i++) {
      const rarity      = rollRarity();
      const characterId = pickCharacter(rarity);
      const char        = CHARACTERS[characterId];

      q.consumePull.run(now, userId);

      const existing = q.getCardByCharacter.get(userId, characterId);
      let   isDuplicate = false;
      let   dupEssence  = 0;

      if (existing) {
        isDuplicate = true;
        dupEssence  = ESSENCE_PER_DUP[char.rarity] ?? 20;
        q.addChakraEssence.run(dupEssence, userId);
      } else {
        q.insertCard.run(userId, characterId);
      }

      results.push({ char, isDuplicate, dupEssence });
    }

    // ── Build result embed ─────────────────────
    const lines = results.map((r, i) => {
      const rarityEmoji = RARITIES[r.char.rarity]?.emoji ?? r.char.rarity;
      if (r.isDuplicate) {
        return `${i + 1}. ~~${r.char.name}~~ ${rarityEmoji} → **${r.dupEssence} Essence**`;
      }
      return `${i + 1}. **${r.char.name}** ${rarityEmoji}`;
    });

    // Discord description limit: split if too long
    const description = lines.join('\n');
    const truncated   = description.length > 3900
      ? description.slice(0, 3900) + '\n…'
      : description;

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle(`⚡ MP Used — ${pullsToUse} Pull${pullsToUse !== 1 ? 's' : ''}`)
        .setDescription(truncated)
        .setFooter({ text: '~strikethrough~ = duplicate → converted to Essence' })],
    });
  },
};
