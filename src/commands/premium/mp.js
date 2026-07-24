// ─────────────────────────────────────────────
//  premium/mp.js  —  N mp  (Mass Pull)
//  Uses all remaining pull attempts at once.
//  Premium (Jinchūriki) only.
// ─────────────────────────────────────────────

const { EmbedBuilder }   = require('discord.js');
const { q }              = require('../../database');
const { CHARACTERS, PULL_POOL } = require('../../data/characters');
const {
  RARITIES, PULL_POOL_RARITIES, ESSENCE_PER_DUP, COLORS,
} = require('../../config');
const { checkRegistered }  = require('../../utils/guards');
const { errorEmbed }       = require('../../utils/embeds');
const { currentPullPeriodStartUTC, nextPullResetUTC, formatCountdown } = require('../../utils/timeUtils');

// ── Custom rarity emojis ───────────────────────
const RARITY_EMOJI = {
  UR: '<:URrarity:1529858402174636174>',
  SS: '<:SSrarity:1529858398378786858>',
  S:  '<:Srarity:1529858395161497670>',
  A:  '<:Ararity:1529858378866753577>',
  B:  '<:Brarity:1529858383069581342>',
  C:  '<:Crarity:1529858387301367898>',
  D:  '<:Drarity:1529858391210721330>',
};

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
  name: 'multipull',
  aliases: ['mp'],
  description: 'Mass Pull — use all remaining pulls at once · Premium only',

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // ── Premium check ──────────────────────────
    if (!hasPremium(user)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
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

      const existing  = q.getCardByCharacter.get(userId, characterId);
      let isDuplicate = false;
      let dupEssence  = 0;

      if (existing) {
        isDuplicate = true;
        dupEssence  = ESSENCE_PER_DUP[char.rarity] ?? 20;
        q.addChakraEssence.run(dupEssence, userId);
      } else {
        q.insertCard.run(userId, characterId);
      }

      results.push({ char, isDuplicate, dupEssence });
    }

    // ── Build result lines ─────────────────────
    const lines = results.map((r, i) => {
      const re = RARITY_EMOJI[r.char.rarity] ?? r.char.rarity;
      if (r.isDuplicate) {
        return `\`${i + 1}\` ${re} ~~${r.char.name}~~\n> converted to chakra essence → **${r.dupEssence}**`;
      }
      return `\`${i + 1}\` ${re} ${r.char.name}`;
    });

    const description = lines.join('\n');
    const truncated   = description.length > 3900
      ? description.slice(0, 3900) + '\n…'
      : description;

    const avatarURL = message.author.displayAvatarURL({ dynamic: true, size: 128 });
    const userName  = message.member?.displayName ?? message.author.username;

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setTitle(`${userName} pulled ${pullsToUse} card${pullsToUse !== 1 ? 's' : ''}!`)
        .setThumbnail(avatarURL)
        .setDescription(truncated)
        .setFooter({ text: 'only jinchūrikis can use this cmd' })],
    });
  },
};
