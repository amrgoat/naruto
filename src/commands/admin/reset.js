// ─────────────────────────────────────────────
//  admin/reset.js  —  N reset @user <cmd>
//  Reset a command's cooldown/timer for a user.
//  Admin only.
//
//  Supported timers:
//    daily  — resets the 24h daily claim
//    arena  — restores all arena attempts
//    pulls  — restores all pulls for the current period
// ─────────────────────────────────────────────

const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { q }      = require('../../database');
const { COLORS, PULLS_PER_PERIOD, ARENA_ATTEMPTS_PER_DAY } = require('../../config');
const { errorEmbed } = require('../../utils/embeds');

const TIMERS = {
  daily: {
    label:   'Daily Reward',
    emoji:   '🎁',
    reset:   (userId) => {
      q.setDailyReset.run(0, userId);
    },
    detail:  (userId) => 'Can claim `N daily` immediately.',
  },
  arena: {
    label:   'Arena Attempts',
    emoji:   '🏟️',
    reset:   (userId) => {
      q.resetArena.run(0, userId);
    },
    detail:  () => `Restored to **${ARENA_ATTEMPTS_PER_DAY}** attempts.`,
  },
  pulls: {
    label:   'Pull Charges',
    emoji:   '📜',
    reset:   (userId) => {
      q.resetPulls.run(0, userId);
    },
    detail:  () => `Restored to **${PULLS_PER_PERIOD}** pulls.`,
  },
};

const TIMER_LIST = Object.keys(TIMERS).map(k => `\`${k}\``).join(', ');

module.exports = {
  name: 'reset',
  description: '[Admin] Reset a command timer for a user · N reset @user <daily|arena|pulls>',

  async execute(message, args) {
    // ── Admin check ────────────────────────────
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ embeds: [errorEmbed('❌ Administrator permission required.')] });
    }

    // ── Parse args ─────────────────────────────
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

    // ── Target must have an account ────────────
    const targetUser = q.getUser.get(target.id);
    if (!targetUser) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** doesn't have an account yet.`)],
      });
    }

    // ── Apply reset ────────────────────────────
    const timer = TIMERS[timerKey];
    timer.reset(target.id);

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(
          `${timer.emoji} **${timer.label}** reset for **${target.username}**.\n` +
          timer.detail(target.id)
        )],
    });
  },
};
