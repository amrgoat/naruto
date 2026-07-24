// ─────────────────────────────────────────────
//  pull.js  —  N pull
//  Summon one ninja card from the scroll.
//  · 12 pulls per period (resets 12 AM & 12 PM IST)
//  · 3-second cooldown between pulls
//  · Duplicates → Chakra Essence (universal, based on rarity)
//  · SS and UR are locked and never appear
// ─────────────────────────────────────────────

const { q }            = require('../database');
const { CHARACTERS, PULL_POOL } = require('../data/characters');
const {
  RARITIES, PULL_POOL_RARITIES, PULL_COOLDOWN_MS, ESSENCE_PER_DUP,
} = require('../config');
const { checkRegistered }       = require('../utils/guards');
const { buildPullEmbed, errorEmbed } = require('../utils/embeds');
const { currentPullPeriodStartUTC, nextPullResetUTC, formatCountdown } = require('../utils/timeUtils');

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

// ── Pick random character for a given rarity ──
function pickCharacter(rarity) {
  const pool = PULL_POOL[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = {
  name: 'pull',
 
  description: 'Summon a ninja card · 12 pulls per reset (12 AM & 12 PM IST)',

  async execute(message) {
    const userId = message.author.id;
    let user = checkRegistered(message);
    if (!user) return;

    const now         = Date.now();
    const periodStart = currentPullPeriodStartUTC(now);

    // ── Period reset check ──────────────────────
    if (user.pulls_reset_at < periodStart) {
      q.resetPulls.run(periodStart, userId);
      user = q.getUser.get(userId);
    }

    // ── Cooldown check ──────────────────────────
    const elapsed = now - user.last_pull_time;
    if (elapsed < PULL_COOLDOWN_MS) {
      const remaining = PULL_COOLDOWN_MS - elapsed;
      const msg = remaining > 1000
        ? `You can pull again in **${(remaining / 1000).toFixed(1)}s**.`
        : `You can pull again in **a few moments**.`;
      return message.reply({ embeds: [errorEmbed(msg)] });
    }

    // ── No pulls left ───────────────────────────
    if (user.pulls_remaining <= 0) {
      const nextReset = nextPullResetUTC(now);
      const waitMs    = nextReset - now;
      return message.reply({
        embeds: [errorEmbed(
          `You've used all **12 pulls** for this period.\n` +
          `Next reset in **${formatCountdown(waitMs)}**.\n\n` +
          `Use \`N ramen\` to restore your pulls instantly.`
        )],
      });
    }

    // ── Roll the card ───────────────────────────
    const rarity      = rollRarity();
    const characterId = pickCharacter(rarity);
    const char        = CHARACTERS[characterId];

    // ── Consume pull ────────────────────────────
    q.consumePull.run(now, userId);

    // ── Duplicate check ─────────────────────────
    const existing    = q.getCardByCharacter.get(userId, characterId);
    let card;
    let isDuplicate   = false;
    let dupEssence    = 0;

    if (existing) {
      isDuplicate = true;
      // Duplicates convert to Chakra Essence only
      dupEssence = ESSENCE_PER_DUP[char.rarity] ?? 20;
      q.addChakraEssence.run(dupEssence, userId);
      card = existing;
    } else {
      // New card
      const result = q.insertCard.run(userId, characterId);
      card         = q.getCard.get(result.lastInsertRowid);
    }

    // ── Build embed ─────────────────────────────
    const memberName = message.member?.displayName ?? message.author.username;
    const embed      = buildPullEmbed(card, isDuplicate, memberName, card.fragments);

    // Append reset info to footer
    const freshUser  = q.getUser.get(userId);
    const pullsLeft  = freshUser.pulls_remaining;
    const nextReset  = nextPullResetUTC(now);
    const resetLabel = `${pullsLeft} pull${pullsLeft !== 1 ? 's' : ''} left · Reset in ${formatCountdown(nextReset - now)}`;
    const ft         = embed.data.footer?.text ?? '';
    embed.setFooter({ text: `${ft}  ·  ${resetLabel}` });

    await message.reply({ embeds: [embed] });

    // ── Duplicate follow-up message ─────────────
    if (isDuplicate) {
      const dupMsg = dupEssence > 0
        ? `| **${memberName}**, seems like you already own **${char.name}**'s card. ` +
          `You obtained **${dupEssence} Chakra Essence**  Total: ${freshUser.chakra_essence}`
        : `| **${memberName}**, seems like you already own **${char.name}**'s card. ` +
          `You obtained **1x ${char.name} Fragment**  Total: ${card.fragments}`;
      await message.channel.send(dupMsg);
    }
  },
};
