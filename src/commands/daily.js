// ─────────────────────────────────────────────
//  daily.js  —  n daily
//  Claim daily rewards once per IST calendar day.
//  Streak increments on consecutive IST days; breaks if you skip.
//  Every 5th streak day → bonus rewards.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, COMBAT_EMOJIS, ARROW_EMOJI } = require('../config');
const { checkRegistered } = require('../utils/guards');
const { errorEmbed }      = require('../utils/embeds');
const { formatCountdown } = require('../utils/timeUtils');

const RAMEN_E = '<:ramen:1529823076118691890>';

const BASE_RYO     = 7_200;
const BASE_RAMEN   = 1;
const BASE_ESSENCE = 7;

const BONUS_RYO   = 14_400;
const BONUS_RAMEN = 3;

/**
 * Get IST calendar day number (seconds since Unix epoch, shifted +5:30).
 */
function istDay(timestampMs) {
  return Math.floor((timestampMs / 1000 + 19800) / 86400);
}

/**
 * UTC timestamp (ms) of the next IST midnight after nowMs.
 */
function nextISTMidnightUTC(nowMs) {
  const todayIST      = istDay(nowMs);
  const nextMidnightS = (todayIST + 1) * 86400 - 19800; // back to UTC seconds
  return nextMidnightS * 1000;
}

/**
 * Build a ★☆ stars string showing position within the 5-day cycle.
 */
function streakStars(streak) {
  const pos = ((streak - 1) % 5) + 1;
  return '★'.repeat(pos) + '☆'.repeat(5 - pos);
}

module.exports = {
  name: 'daily',
  description: 'Claim your daily rewards · n daily',

  async execute(message) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    const now      = Date.now();
    const today    = istDay(now);
    const lastDay  = user.daily_streak_last_day ?? 0;

    // ── Already claimed today ──────────────────
    if (lastDay >= today) {
      const remaining = nextISTMidnightUTC(now) - now;
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.EMBED_COLOR)
          .setTitle('🎁 Daily Rewards')
          .setDescription(
            `You already collected your daily rewards today.\n\n` +
            `⏳ Come back in **${formatCountdown(remaining)}**`
          )
          .setFooter({ text: 'Resets every day at 12:00 AM IST' })],
      });
    }

    // ── Streak calculation ─────────────────────
    let streak = user.daily_streak ?? 0;

    if (lastDay === today - 1) {
      // Consecutive IST day
      streak += 1;
    } else {
      // Missed one or more days (or first ever claim)
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
      `${ARROW_EMOJI} Ryo Obtained: **${ryo.toLocaleString()}** ${COMBAT_EMOJIS.ryo}`,
      `${ARROW_EMOJI} Ramen Obtained: **${ramen}** ${RAMEN_E}`,
      `${ARROW_EMOJI} Chakra Essence Obtained: **${essence}** ${COMBAT_EMOJIS.essence}`,
      `${ARROW_EMOJI} Daily Streak: **${streak}** day${streak !== 1 ? 's' : ''}  ${stars}`,
    ];

    if (isBonus) {
      lines.push('', `🎉 **5-Day Streak Bonus!** Double Ryo + extra Ramen awarded.`);
    }

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setTitle(title)
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'Resets every day at 12:00 AM IST' })],
    });
  },
};
