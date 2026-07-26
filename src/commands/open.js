// ─────────────────────────────────────────────
//  open.js  —  N open <amount|all> <scroll>
//
//  Opens one or more scrolls and awards rewards
//  entirely driven by src/data/scroll_rewards.json.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q, scrollStatements } = require('../database');
const { checkRegistered }     = require('../utils/guards');
const { errorEmbed }          = require('../utils/embeds');
const {
  REWARDS_CONFIG,
  resolveScrollKey,
  rollScrolls,
  applyRewards,
  formatRewardLines,
} = require('../utils/scrollEngine');

// ── Helpers ───────────────────────────────────

/** Pause for `ms` milliseconds */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Return how many of a given scroll the user owns */
function getScrollCount(user, dbCol) {
  return user[dbCol] ?? 0;
}

// ── Embeds ────────────────────────────────────

function buildOpeningEmbed(count, scrollLabel, scrollColor) {
  return new EmbedBuilder()
    .setColor(scrollColor)
    .setTitle('Opening Scrolls...')
    .setDescription(
      `Opening **${count}** ${scrollLabel}${count !== 1 ? 's' : ''}\n\n` +
      `Please wait...`
    );
}

function buildRewardEmbed(count, scrollKey, combined) {
  const scroll     = REWARDS_CONFIG[scrollKey];
  const rewardLines = formatRewardLines(combined, scrollKey);

  const desc = [
    `Opened **${count}** ${scroll.label}${count !== 1 ? 's' : ''}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '**Rewards**',
  ];

  if (rewardLines.length === 0) {
    desc.push('*No rewards this time.*');
  } else {
    desc.push(...rewardLines);
  }

  return new EmbedBuilder()
    .setColor(scroll.color)
    .setTitle(`${scroll.label} — Opened Successfully`)
    .setDescription(desc.join('\n'))
    .setFooter({ text: 'Rewards have been added to your inventory.' });
}

// ── Command ───────────────────────────────────

module.exports = {
  name: 'open',
  description: 'Open scrolls to claim rewards · N open <amount|all> <scroll>',

  async execute(message, args) {
    const user = checkRegistered(message);
    if (!user) return;

    // ── Argument parsing ────────────────────────
    // Expected: N open <amount|all> <scroll>
    if (args.length < 2) {
      return message.reply({
        embeds: [errorEmbed(
          'Usage: `N open <amount|all> <scroll>`\n' +
          'Example: `N open 5 mission` · `N open all hokage`\n\n' +
          '**Scroll types:** academy · chunin · mission · jonin · anbu · hokage'
        )],
      });
    }

    const [rawAmount, rawScroll] = args;

    // Resolve scroll type
    const scrollKey = resolveScrollKey(rawScroll);
    if (!scrollKey) {
      return message.reply({
        embeds: [errorEmbed(
          `Unknown scroll type: **${rawScroll}**\n\n` +
          '**Valid types:** academy · chunin · mission · jonin · anbu · hokage'
        )],
      });
    }

    const scroll   = REWARDS_CONFIG[scrollKey];
    const owned    = getScrollCount(user, scroll.db_col);

    // Check ownership
    if (owned === 0) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(scroll.color)
          .setTitle('No Scrolls')
          .setDescription(`You don't own any **${scroll.label}s**.`)],
      });
    }

    // Determine count to open
    let count;
    if (rawAmount.toLowerCase() === 'all') {
      count = owned;
    } else {
      const parsed = parseInt(rawAmount, 10);
      if (isNaN(parsed) || parsed < 1) {
        return message.reply({
          embeds: [errorEmbed('Amount must be a positive number or **all**.')],
        });
      }
      // If requested more than owned, open all available
      count = Math.min(parsed, owned);
    }

    // ── Opening animation ───────────────────────
    const reply = await message.reply({
      embeds: [buildOpeningEmbed(count, scroll.label, scroll.color)],
    });

    await sleep(2000);

    // ── Roll & apply rewards ────────────────────
    const combined = rollScrolls(scrollKey, count);
    applyRewards(q, scrollStatements, user.discord_id, scrollKey, count, combined);

    // ── Edit to reward embed ────────────────────
    try {
      await reply.edit({
        embeds: [buildRewardEmbed(count, scrollKey, combined)],
      });
    } catch {
      // Message may have been deleted; send a fresh one
      await message.reply({
        embeds: [buildRewardEmbed(count, scrollKey, combined)],
      });
    }
  },
};
