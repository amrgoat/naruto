// ─────────────────────────────────────────────
//  shop.js  —  t shop / t shop buy <amount> <item>
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { CHARACTERS }   = require('../data/characters');
const {
  COLORS, E, COMBAT_EMOJIS, RARITIES,
  SHOP_ITEMS,
} = require('../config');
const { checkRegistered } = require('../utils/guards');
const { todayISTMidnightUTC } = require('../utils/timeUtils');
const { scrollStatements } = require('../database');

// ── Random scroll pool (no mission scrolls) ───
const RANDOM_SCROLL_COLS = [
  'academy_scrolls',
  'chunin_scrolls',
  'jonin_scrolls',
  'anbu_scrolls',
  'hokage_scrolls',
];

// Friendly labels for each scroll col
const SCROLL_LABELS = {
  academy_scrolls: 'Academy Scroll',
  chunin_scrolls:  'Chunin Scroll',
  jonin_scrolls:   'Jonin Scroll',
  anbu_scrolls:    'ANBU Scroll',
  hokage_scrolls:  'Hokage Scroll',
};

// ── Item aliases ──────────────────────────────
function resolveItem(query) {
  const q_ = query.toLowerCase().replace(/[_\s-]+/g, '');
  if (['ramen'].includes(q_))                               return SHOP_ITEMS.ramen;
  if (['randomscroll','random','rs','scroll'].includes(q_)) return SHOP_ITEMS.random_scroll;
  if (['expscroll','exp','es','expscrolls'].includes(q_))   return SHOP_ITEMS.exp_scroll;
  if (['chakra','chakraessence','ce','essence'].includes(q_)) return SHOP_ITEMS.chakra;
  return null;
}

// ── Shop embed ────────────────────────────────
function buildShopEmbed() {
  const lines = [
    `${E.ramen} **Ramen** — \`4,000 Ryo\``,
    `${E.scroll} **Random Scroll** — \`3,000 Ryo\``,
    `${E.scroll} **EXP Scroll** — \`5,000 Ryo\``,
    `${COMBAT_EMOJIS.essence} **Chakra Essence** — \`500 Ryo\``,
    ``,
    `Use \`t shop buy <amount> <item>\` to purchase.`,
    `*Example: \`t shop buy 3 ramen\`*`,
  ];

  return new EmbedBuilder()
    .setColor(COLORS.EMBED_COLOR)
    .setTitle(`${E.scroll} Ninja Shop`)
    .setDescription(lines.join('\n'));
}

// ── Apply purchased item ───────────────────────
function applyPurchase(userId, itemKey, amount) {
  if (itemKey === 'ramen') {
    q.addRamen.run(amount, userId);
    return `${E.ramen} **${amount}x Ramen**`;
  }

  if (itemKey === 'exp_scroll') {
    q.addExpScrolls.run(amount, userId);
    return `${E.scroll} **${amount}x EXP Scroll**`;
  }

  if (itemKey === 'chakra') {
    q.addChakraEssence.run(amount, userId);
    return `${COMBAT_EMOJIS.essence} **${amount}x Chakra Essence**`;
  }

  if (itemKey === 'random_scroll') {
    // Roll each scroll individually
    const tally = {};
    for (let i = 0; i < amount; i++) {
      const col = RANDOM_SCROLL_COLS[Math.floor(Math.random() * RANDOM_SCROLL_COLS.length)];
      tally[col] = (tally[col] ?? 0) + 1;
    }
    for (const [col, cnt] of Object.entries(tally)) {
      scrollStatements[col].add.run(cnt, userId);
    }
    const summary = Object.entries(tally)
      .map(([col, cnt]) => `${cnt}x ${SCROLL_LABELS[col]}`)
      .join(', ');
    return `${E.scroll} **${summary}**`;
  }

  return '**items**';
}

module.exports = {
  name: 'shop',
  description: 'Browse and buy items · t shop | t shop buy <amount> <item>',

  async execute(message, args) {
    const userId = message.author.id;
    const user   = checkRegistered(message);
    if (!user) return;

    // ── t shop (no args) → show shop ──────────
    if (!args.length || args[0].toLowerCase() !== 'buy') {
      return message.reply({ embeds: [buildShopEmbed()] });
    }

    // ── t shop buy <amount> <item> ─────────────
    // args[0] = 'buy', args[1] = amount, args[2..] = item name
    const amount = parseInt(args[1], 10);
    if (isNaN(amount) || amount < 1) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription('Usage: `t shop buy <amount> <item>`')],
      });
    }

    const itemQuery = args.slice(2).join(' ').trim();
    if (!itemQuery) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription('Usage: `t shop buy <amount> <item>`')],
      });
    }

    const item = resolveItem(itemQuery);
    if (!item) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(
            `Unknown item **"${itemQuery}"**.\nAvailable: \`ramen\`, \`random scroll\`, \`exp scroll\`, \`chakra\``
          )],
      });
    }

    // ── Daily limit check ──────────────────────
    const now        = Date.now();
    const todayReset = todayISTMidnightUTC(now);

    // Reset shop counters if new day
    let freshUser = user;
    if ((freshUser.shop_reset_at ?? 0) < todayReset) {
      q.resetShop.run(todayReset, userId);
      freshUser = q.getUser.get(userId);
    }

    const boughtToday = freshUser[item.dbLimitCol] ?? 0;
    const canBuy      = item.dailyLimit - boughtToday;

    if (canBuy <= 0) {
      return message.reply(
        `You've reached today's limit for **${item.label}**. Come back tomorrow!`
      );
    }

    if (amount > canBuy) {
      return message.reply(
        `You can only buy **${canBuy}** more **${item.label}** today.`
      );
    }

    // ── Cost check ─────────────────────────────
    const totalCost = item.price * amount;
    if (freshUser.ryo < totalCost) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(
            `Not enough Ryo.\nNeed **${totalCost.toLocaleString()}** — you have **${freshUser.ryo.toLocaleString()}** ${E.ryo}`
          )],
      });
    }

    // ── Apply purchase ─────────────────────────
    q.deductRyo.run(totalCost, userId);
    q.incrementShopCol[item.dbLimitCol].run(amount, userId);
    const itemStr = applyPurchase(userId, item.key, amount);

    const afterUser = q.getUser.get(userId);
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(
          `Purchased ${itemStr} for **${totalCost.toLocaleString()} Ryo** ${E.ryo}\n` +
          `Balance: **${afterUser.ryo.toLocaleString()}** ${E.ryo}`
        )],
    });
  },
};
