// ─────────────────────────────────────────────
//  profile.js  —  N profile
//  Displays a player's ninja profile.
// ─────────────────────────────────────────────

const { EmbedBuilder }      = require('discord.js');
const { q }                 = require('../database');
const { COLORS, E, PULLS_PER_PERIOD, ARENA_ATTEMPTS_PER_DAY } = require('../config');
const { CHARACTERS }        = require('../data/characters');
const { checkRegistered }   = require('../utils/guards');
const { starsDisplay, rarityBadge, getEffectiveStats } = require('../utils/cardUtils');
const { nextPullResetUTC, todayISTMidnightUTC, formatCountdown, currentPullPeriodStartUTC } = require('../utils/timeUtils');

// Total pullable characters for collection progress
const TOTAL_CHARACTERS = Object.values(CHARACTERS).filter(c => !c.pullLocked).length;

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

    // ── Pulls: auto-reset if period changed ──────
    const periodStart = currentPullPeriodStartUTC(now);
    if (user.pulls_reset_at < periodStart) {
      q.resetPulls.run(periodStart, userId);
      user = q.getUser.get(userId);
    }

    // ── Arena: auto-reset if new day ─────────────
    const todayMidnight = todayISTMidnightUTC(now);
    if (user.arena_reset_at < todayMidnight) {
      q.resetArena.run(todayMidnight, userId);
      user = q.getUser.get(userId);
    }

    // ── Data ──────────────────────────────────────
    const teamCards   = q.getTeam.all(userId);
    const allCards    = q.getUserCards.all(userId);
    const uniqueChars = new Set(allCards.map(c => c.character_id)).size;

    const nextReset  = nextPullResetUTC(now);
    const pullsLine  = `**${user.pulls_remaining}** / ${PULLS_PER_PERIOD}  *(reset in ${formatCountdown(nextReset - now)})*`;
    const arenaLine  = `**${user.arena_attempts}** / ${ARENA_ATTEMPTS_PER_DAY}`;

    // ── Team display ──────────────────────────────
    let teamText = '';
    if (teamCards.length === 0) {
      teamText = '*No cards in team — use `N team add <name>`*';
    } else {
      teamText = teamCards.map(card => {
        const char  = CHARACTERS[card.character_id];
        const stars = starsDisplay(card.stars);
        return `${rarityBadge(char.rarity)} **${char.name}**  M${card.mastery} Lv.${card.level}${stars ? `  ${stars}` : ''}`;
      }).join('\n');
      for (let i = teamCards.length; i < 4; i++) {
        teamText += '\n*— Empty Slot —*';
      }
    }

    // ── Build embed ───────────────────────────────
    const embed = new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`${E.leaf} ${user.username}'s Ninja Profile`)
      .setThumbnail(target.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: `${E.ryo} Ryo`,              value: `**${user.ryo.toLocaleString()}**`,            inline: true },
        { name: `${E.ramen} Ramen`,           value: `**${user.ramen}**`,                           inline: true },
        { name: '\u26a1 Chakra Essence',      value: `**${(user.chakra_essence ?? 0).toLocaleString()}**`, inline: true },
        { name: '\u{1F4dc} EXP Scrolls',      value: `**${user.exp_scrolls ?? 0}**`,                inline: true },
        { name: `${E.pull} Pulls`,            value: pullsLine,                                     inline: false },
        { name: `${E.arena} Arena`,           value: arenaLine,                                     inline: false },
        { name: `${E.team} Active Team`,      value: teamText,                                      inline: false },
        {
          name:  `${E.scroll} Collection`,
          value: `**${uniqueChars}** / **${TOTAL_CHARACTERS}** characters`,
          inline: false,
        },
      )
      .setFooter({ text: `Ninja since ${new Date(user.created_at * 1000).toLocaleDateString()}` });

    return message.reply({ embeds: [embed] });
  },
};
