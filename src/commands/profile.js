// ─────────────────────────────────────────────
//  profile.js  —  N profile
//  Displays a player's ninja profile.
// ─────────────────────────────────────────────

const { EmbedBuilder }    = require('discord.js');
const { q }               = require('../database');
const { COLORS, E, COMBAT_EMOJIS, ARROW_EMOJI, WALLET_EMOJI, RARITIES } = require('../config');
const { CHARACTERS }      = require('../data/characters');
const { checkRegistered } = require('../utils/guards');
const { currentPullPeriodStartUTC, todayISTMidnightUTC } = require('../utils/timeUtils');

module.exports = {
  name: 'profile',
  description: 'View your ninja profile.',

  async execute(message, args) {
    // Support N profile @user
    const target = message.mentions.users.first() ?? message.author;
    const userId = target.id;

    let user = q.getUser.get(userId);
    if (!user) {
      if (target.id === message.author.id) {
        return message.reply({ embeds: [require('../utils/embeds').errorEmbed(
          "You don't have an account yet.\nRun **N start** to begin your ninja journey."
        )] });
      }
      return message.reply({ embeds: [require('../utils/embeds').errorEmbed(
        `**${target.username}** doesn't have an account yet.`
      )] });
    }

    const now = Date.now();

    // ── Auto-resets ───────────────────────────────
    const periodStart = currentPullPeriodStartUTC(now);
    if (user.pulls_reset_at < periodStart) {
      q.resetPulls.run(periodStart, userId);
      user = q.getUser.get(userId);
    }

    const todayMidnight = todayISTMidnightUTC(now);
    if (user.arena_reset_at < todayMidnight) {
      q.resetArena.run(todayMidnight, userId);
      user = q.getUser.get(userId);
    }

    // ── Card counts ───────────────────────────────
    const allCards   = q.getUserCards.all(userId);
    const totalCards = allCards.length;
    const m1Cards    = allCards.filter(c => c.mastery === 1).length;
    const m2Cards    = allCards.filter(c => c.mastery === 2).length;
    const m3Cards    = allCards.filter(c => c.mastery === 3).length;

    // ── Build description ─────────────────────────
    const A = ARROW_EMOJI;

    // ── Active team ───────────────────────────────
    const teamCards  = q.getTeam.all(userId);
    const teamLines  = teamCards.map(card => {
      const char       = CHARACTERS[card.character_id];
      const rarityEmoji = RARITIES[char?.rarity]?.emoji ?? '';
      return `${rarityEmoji} **${char?.name ?? card.character_id}**  M${card.mastery} Lv.${card.level}`;
    });

    const userLevel = user.user_level ?? 1;
    const userExp   = user.user_exp   ?? 0;

    const desc = [
      `${WALLET_EMOJI} **Balance:**`,
      `${A} Ryo: **${user.ryo.toLocaleString()}** ${E.ryo}`,
      `${A} Ramen: **${user.ramen}** ${E.ramen}`,
      `${A} Chakra Essence: **${(user.chakra_essence ?? 0).toLocaleString()}** ${COMBAT_EMOJIS.essence}`,
      `${A} Badges: *(none yet)*`,
      ``,
      `🃏 **Cards:**`,
      `${A} Total Cards Owned: **${totalCards}**`,
      `${A} M1 Cards Owned: **${m1Cards}**`,
      `${A} M2 Cards Owned: **${m2Cards}**`,
      `${A} M3 Cards Owned: **${m3Cards}**`,
      `${A} Cards Pulled: **${user.total_pulls ?? 0}**`,
      ``,
      `📊 **Stats:**`,
      `${A} Rank: **Ninja**`,
      `${A} Level: **${userLevel}** \`(${userExp}/1000 XP)\``,
      `${A} Missions Finished: **${user.missions_finished ?? 0}**`,
      `${A} All Time Votes: **${user.all_time_votes ?? 0}**`,
      `${A} Vote Streak: **${user.vote_streak ?? 0}**`,
      ``,
      `🥷 **Active Team:**`,
      ...(teamLines.length ? teamLines : [`*(no team set)*`]),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setColor(COLORS.EMBED_COLOR)
      .setTitle(`${target.username}'s Ninja Profile`)
      .setThumbnail(target.displayAvatarURL({ size: 128 }))
      .setDescription(desc);

    return message.reply({ embeds: [embed] });
  },
};
