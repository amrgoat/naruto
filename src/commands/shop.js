// ─────────────────────────────────────────────
//  shop.js  —  t shop / t shop buy <amount> <item>
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q, scrollStatements, trialTicketStatements } = require('../database');
const {
  COLORS, E, COMBAT_EMOJIS,
  SHOP_ITEMS,
} = require('../config');
const { checkRegistered } = require('../utils/guards');
const { todayISTMidnightUTC } = require('../utils/timeUtils');

// ── Random scroll pool (no mission scrolls) ───
const RANDOM_SCROLL_COLS = [
  'academy_scrolls',
  'chunin_scrolls',
  'jonin_scrolls',
  'anbu_scrolls',
  'hokage_scrolls',
];

const SCROLL_LABELS = {
  academy_scrolls: 'Academy Scroll',
  chunin_scrolls:  'Chunin Scroll',
  jonin_scrolls:   'Jonin Scroll',
  anbu_scrolls:    'ANBU Scroll',
  hokage_scrolls:  'Hokage Scroll',
};

// ── Trial ticket helpers ──────────────────────
// Academy 30% · Chunin 27% · Jonin 23% · ANBU 20% (sums to 100%)
const TICKET_ROLLS = [
  { col: 'academy_trial_tickets', threshold: 30,  label: 'Academy' },
  { col: 'chunin_trial_tickets',  threshold: 57,  label: 'Chunin'  },
  { col: 'jonin_trial_tickets',   threshold: 80,  label: 'Jonin'   },
  { col: 'anbu_trial_tickets',    threshold: 100, label: 'ANBU'    },
];

function rollTicketType() {
  const r = Math.random() * 100;
  for (const entry of TICKET_ROLLS) {
    if (r < entry.threshold) return entry;
  }
  return TICKET_ROLLS[TICKET_ROLLS.length - 1];
}

// ── Item aliases ──────────────────────────────
function resolveItem(query) {
  const q_ = query.toLowerCase().replace(/[_\s-]+/g, '');
  if (['ramen'].includes(q_))                                   return SHOP_ITEMS.ramen;
  if (['randomscroll','random','rs','scroll'].includes(q_))     return SHOP_ITEMS.random_scroll;
  if (['expscroll','exp','es','expscrolls'].includes(q_))       return SHOP_ITEMS.exp_scroll;
  if (['chakra','chakraessence','ce','essence'].includes(q_))   return SHOP_ITEMS.chakra;
  if (['trialticket','ticket','tt','trial'].includes(q_))       return SHOP_ITEMS.trial_ticket;
  return null;
}

// ── Shop embed ────────────────────────────────
function buildShopEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.EMBED_COLOR)
    .setTitle(`${E.scroll} Ninja Shop`)
    .addFields(
      {
        name: '💰 Ryo Items',
        value: [
          `${E.ramen} **Ramen** — \`4,000 Ryo\`  *(3/day)*`,
          `${E.scroll} **Random Scroll** — \`3,000 Ryo\`  *(5/day)*`,
          `${E.scroll} **EXP Scroll** — \`5,000 Ryo\`  *(20/day)*`,
          `${COMBAT_EMOJIS.essence} **Chakra Essence** — \`500 Ryo\`  *(200/day)*`,
        ].join('\n'),
      },
      {
        name: `${COMBAT_EMOJIS.essence} Chakra Essence Items`,
        value: [
          `🎫 **Trial Ticket** — \`1,000 Chakra Essence\`  *(3/day)*`,
          `> Academy 30% · Chunin 27% · Jonin 23% · ANBU 20%`,
        ].join('\n'),
      },
      {
        name: 'Usage',
        value: '`t shop buy <amount> <item>`\n*Examples: `t shop buy 3 ramen` · `t shop buy 1 ticket`*',
      }
    );
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

  if (itemKey === 'trial_ticket') {
    const tally = {};
    for (let i = 0; i < amount; i++) {
      const { col, label } = rollTicketType();
      tally[col] = tally[col] ?? { count: 0, label };
      tally[col].count++;
    }
    for (const [col, { count }] of Object.entries(tally)) {
      trialTicketStatements[col].add.run(count, userId);
    }
    const summary = Object.values(tally)
      .map(({ count, label }) => `${count}x ${label}`)
      .join(', ');
    return `🎫 **${summary} Trial Ticket${amount > 1 ? 's' : ''}**`;
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
            `Unknown item **"${itemQuery}"**.\nAvailable: \`ramen\`, \`random scroll\`, \`exp scroll\`, \`chakra\`, \`ticket\``
          )],
      });
    }

    // ── Daily limit check ──────────────────────
    const now        = Date.now();
    const todayReset = todayISTMidnightUTC(now);

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

    // ── Cost and balance check ─────────────────
    const totalCost     = item.price * amount;
    const isChakraPay   = item.priceType === 'chakra';
    const balance       = isChakraPay ? (freshUser.chakra_essence ?? 0) : (freshUser.ryo ?? 0);
    const currencyName  = isChakraPay ? 'Chakra Essence' : 'Ryo';
    const currencyEmoji = isChakraPay ? COMBAT_EMOJIS.essence : E.ryo;

    if (balance < totalCost) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription(
            `Not enough ${currencyName}.\nNeed **${totalCost.toLocaleString()}** — you have **${balance.toLocaleString()}** ${currencyEmoji}`
          )],
      });
    }

    // ── Apply purchase ─────────────────────────
    if (isChakraPay) {
      q.deductChakraEssence.run(totalCost, userId);
    } else {
      q.deductRyo.run(totalCost, userId);
    }
    q.incrementShopCol[item.dbLimitCol].run(amount, userId);
    const itemStr = applyPurchase(userId, item.key, amount);

    const afterUser    = q.getUser.get(userId);
    const afterBalance = isChakraPay ? afterUser.chakra_essence : afterUser.ryo;

    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(
          `Purchased ${itemStr} for **${totalCost.toLocaleString()} ${currencyName}** ${currencyEmoji}\n` +
          `Balance: **${afterBalance.toLocaleString()}** ${currencyEmoji}`
        )],
    });
  },
};
