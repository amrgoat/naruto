// ─────────────────────────────────────────────
//  daily.js  —  N daily
//  Claim daily rewards once every 24 hours.
//  Base: 7,200 Ryo · 1 Ramen · 7 Chakra Essence
//  Streak: every 5th day → 14,400 Ryo + 3 Ramen
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, COMBAT_EMOJIS } = require('../config');
const { checkRegistered }       = require('../utils/guards');
const { errorEmbed }            = require('../utils/embeds');
const { formatCountdown }       = require('../utils/timeUtils');

const ARROW   = '<:arrowRed:1529820697172508712>';
const RAMEN_E = '<:ramen:1529823076118691890>';

const BASE_RYO     = 7_200;
const BASE_RAMEN   = 1;
const BASE_ESSENCE = 7;

const BONUS_RYO   = 14_400;  // double on 5th day
const BONUS_RAMEN = 3;

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in ms

/**
 * Get IST calendar day number (seconds since epoch ÷ 86400, shifted +5:30).
 */
function istDay(timestampMs) {
  return Math.floor((timestampMs / 1000 + 19800) / 86400);
}

/**
 * Build a ★☆ stars string for the given streak.
 * Shows position within the 5-day cycle (max 5 stars).
 */
function streakStars(streak) {
  const pos = ((streak - 1) % 5) + 1;
  return '★'.repeat(pos) + '☆'.repeat(5 - pos);
}

module.exports = {
  name: 'daily',
  description: 'Claim your daily rewards · N daily',

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    const now     = Date.now();
    const elapsed = now - user.daily_reset_at;

    // ── Cooldown check ─────────────────────────
    if (user.daily_reset_at > 0 && elapsed < COOLDOWN) {
      const remaining = COOLDOWN - elapsed;
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.default)
          .setTitle('🎁 Daily Rewards')
          .setDescription(
            `You already collected your daily rewards.\n\n` +
            `⏳ Try again in **${formatCountdown(remaining)}**`
          )
          .setFooter({ text: 'You can claim daily again in 24hr' })],
      });
    }

    // ── Streak calculation ─────────────────────
    const today    = istDay(now);
    const lastDay  = user.daily_streak_last_day ?? 0;
    let   streak   = user.daily_streak ?? 0;

    if (lastDay === today - 1) {
      // Consecutive day
      streak += 1;
    } else {
      // Missed a day or first claim
      streak = 1;
    }

    // ── Bonus on every 5th day ─────────────────
    const isBonus = streak % 5 === 0;
    const ryo     = isBonus ? BONUS_RYO   : BASE_RYO;
    const ramen   = isBonus ? BONUS_RAMEN : BASE_RAMEN;
    const essence = BASE_ESSENCE;

    // ── Apply rewards ──────────────────────────
    q.addRyo.run(ryo, userId);
    q.addRamen.run(ramen, userId);
    q.addChakraEssence.run(essence, userId);
    q.setDailyReset.run(now, userId);
    q.updateDailyStreak.run(streak, today, userId);

    // ── Build embed ────────────────────────────
    const stars = streakStars(streak);
    const title = isBonus
      ? '🌟 Bonus Day! Daily Rewards have been claimed successfully'
      : 'Daily Rewards have been claimed successfully';

    const lines = [
      `${ARROW} Ryo Obtained: **${ryo.toLocaleString()}** ${COMBAT_EMOJIS.ryo}`,
      `${ARROW} Ramen Obtained: **${ramen}** ${RAMEN_E}`,
      `${ARROW} Chakra Essence Obtained: **${essence}** ${COMBAT_EMOJIS.essence}`,
      `${ARROW} Daily Streak: ${stars}`,
    ];

    if (isBonus) {
      lines.push('', `🎉 **5-Day Streak Bonus!** Double Ryo + extra Ramen awarded.`);
    }

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(isBonus ? COLORS.prestige : 0x7C3AED)
        .setTitle(title)
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'You can claim daily again in 24hr' })],
    });
  },
};
