// ─────────────────────────────────────────────
//  admin/reset.js  —  N reset @user <cmd>
//  Reset a command's cooldown/timer for a user.
//  Owner only.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../../database');
const { COLORS, PULLS_PER_PERIOD, ARENA_ATTEMPTS_PER_DAY } = require('../../config');
const { errorEmbed }   = require('../../utils/embeds');
const { isOwner }      = require('../../utils/owner');

const TIMERS = {
  daily: {
    label:  'Daily Reward',
    emoji:  '🎁',
    reset:  (userId) => q.setDailyReset.run(0, userId),
    detail: ()       => 'Can claim `N daily` immediately.',
  },
  arena: {
    label:  'Arena Attempts',
    emoji:  '🏟️',
    reset:  (userId) => q.resetArena.run(0, userId),
    detail: ()       => `Restored to **${ARENA_ATTEMPTS_PER_DAY}** attempts.`,
  },
  pulls: {
    label:  'Pull Charges',
    emoji:  '📜',
    reset:  (userId) => q.resetPulls.run(0, userId),
    detail: ()       => `Restored to **${PULLS_PER_PERIOD}** pulls.`,
  },
};

const TIMER_LIST = Object.keys(TIMERS).map(k => `\`${k}\``).join(', ');

module.exports = {
  name: 'reset',
  description: '[Admin] Reset a command timer for a user · N reset @user <daily|arena|pulls>',

  async execute(message, args) {
    if (!isOwner(message.author.id)) return;

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply({
        embeds: [errorEmbed(`**Usage:** \`N reset @user <timer>\`\n**Timers:** ${TIMER_LIST}`)],
      });
    }

    const timerKey = args.find(a => !a.match(/^<@!?\d+>$/))?.toLowerCase();
    if (!timerKey || !TIMERS[timerKey]) {
      return message.reply({
        embeds: [errorEmbed(
          `Unknown timer **"${timerKey ?? ''}"**.\n**Available:** ${TIMER_LIST}`
        )],
      });
    }

    const targetUser = q.getUser.get(target.id);
    if (!targetUser) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** doesn't have an account yet.`)],
      });
    }

    const timer = TIMERS[timerKey];
    timer.reset(target.id);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.EMBED_COLOR)
        .setDescription(
          `${timer.emoji} **${timer.label}** reset for **${target.username}**.\n` +
          timer.detail(target.id)
        )],
    });
  },
};
