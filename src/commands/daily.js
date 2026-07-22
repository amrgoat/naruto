// ─────────────────────────────────────────────
//  daily.js  —  N daily
//  Claim daily rewards once per day (resets 12 AM IST).
//  Rewards: Ryo · Ramen · Chakra Essence · EXP Scrolls
//  Passives that modify daily: Konohamaru (Ryo) · Teuchi (Ramen) · Tsunade (jackpot)
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { COLORS, E, DAILY_REWARDS } = require('../config');
const { checkRegistered }          = require('../utils/guards');
const { resolvePassiveBonuses }    = require('../utils/passives');
const { errorEmbed }               = require('../utils/embeds');
const { todayISTMidnightUTC, formatCountdown } = require('../utils/timeUtils');

const JACKPOT_RYO    = 10_000;
const JACKPOT_CHANCE = 0.01; // 1%

module.exports = {
  name: 'daily',
  description: 'Claim your daily rewards · N daily',

  async execute(message) {
    const userId = message.author.id;
    let user = checkRegistered(message);
    if (!user) return;

    const now           = Date.now();
    const todayMidnight = todayISTMidnightUTC(now);

    // ── Cooldown check ─────────────────────────
    if (user.daily_reset_at >= todayMidnight) {
      const nextMidnight = todayMidnight + 24 * 60 * 60 * 1000;
      return message.reply({
        embeds: [errorEmbed(
          `You already claimed your daily rewards.\n` +
          `Come back in **${formatCountdown(nextMidnight - now)}**.`
        )],
      });
    }

    // ── Passive bonuses ────────────────────────
    const pb = resolvePassiveBonuses(userId);

    // ── Calculate rewards ──────────────────────
    let ryo           = DAILY_REWARDS.ryo    + pb.dailyRyo;
    let ramen         = DAILY_REWARDS.ramen  + pb.dailyRamen;
    const essence     = DAILY_REWARDS.chakraEssence;
    const expScrolls  = DAILY_REWARDS.expScrolls;

    let jackpotWon = false;
    if (pb.tsunadeJackpot && Math.random() < JACKPOT_CHANCE) {
      ryo       += JACKPOT_RYO;
      jackpotWon = true;
    }

    // ── Apply rewards ──────────────────────────
    q.addRyo.run(ryo, userId);
    q.addRamen.run(ramen, userId);
    q.addChakraEssence.run(essence, userId);
    q.addExpScrolls.run(expScrolls, userId);
    q.setDailyReset.run(todayMidnight, userId);

    // ── Refresh user ───────────────────────────
    const freshUser = q.getUser.get(userId);

    // ── Reward breakdown lines ─────────────────
    const rewardLines = [`**${E.ryo} ${ryo.toLocaleString()} Ryo**  (base ${DAILY_REWARDS.ryo.toLocaleString()}`];
    if (pb.dailyRyo)  rewardLines[0] += ` + ${pb.dailyRyo.toLocaleString()} Konohamaru bonus`;
    if (jackpotWon)   rewardLines[0] += ` + ${JACKPOT_RYO.toLocaleString()} JACKPOT!`;
    rewardLines[0] += ')';

    rewardLines.push(`**${E.ramen} ${ramen} Ramen**${pb.dailyRamen ? `  (+${pb.dailyRamen} Teuchi bonus)` : ''}`);
    rewardLines.push(`**\u26a1 ${essence} Chakra Essence**`);
    rewardLines.push(`**\u{1F4dc} ${expScrolls} EXP Scroll${expScrolls !== 1 ? 's' : ''}**`);

    const embed = new EmbedBuilder()
      .setColor(jackpotWon ? COLORS.prestige : COLORS.success)
      .setTitle(jackpotWon ? '\u{1F3B0} Tsunade\'s Jackpot! — Daily Rewards' : 'Daily Rewards Claimed')
      .setDescription(rewardLines.join('\n'))
      .addFields(
        { name: `${E.ryo} Ryo`,           value: `**${freshUser.ryo.toLocaleString()}**`,           inline: true },
        { name: `${E.ramen} Ramen`,        value: `**${freshUser.ramen}**`,                          inline: true },
        { name: '\u26a1 Chakra Essence',   value: `**${freshUser.chakra_essence.toLocaleString()}**`, inline: true },
      )
      .setFooter({ text: 'Resets at midnight IST  ·  Passives modify your daily rewards' });

    return message.reply({ embeds: [embed] });
  },
};
