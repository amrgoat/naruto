// ─────────────────────────────────────────────
//  items/index.js  —  All bot item definitions
//
//  tradable: true  → can be traded between players (future trade system)
//  tradable: false → soul-bound, stays with the player who earned it
// ─────────────────────────────────────────────

const { COMBAT_EMOJIS, E } = require('../config');

const ITEMS = {
  // ── Currency / core ───────────────────────
  ryo: {
    id: 'ryo', name: 'Ryo', emoji: COMBAT_EMOJIS.ryo, tradable: true,
    description: 'The primary currency of the ninja world.',
    db_col: 'ryo',
    aliases: ['ryo', 'gold', 'money', 'coins'],
  },

  ramen: {
    id: 'ramen', name: 'Ramen', emoji: E.ramen, tradable: false,
    description: "Ichiraku's finest. Restores 12 pulls instantly.",
    db_col: 'ramen',
    aliases: ['ramen', 'noodles', 'food'],
  },

  essence: {
    id: 'essence', name: 'Chakra Essence', emoji: COMBAT_EMOJIS.essence, tradable: true,
    description: 'Crystallised chakra used in crafting.',
    db_col: 'chakra_essence',
    aliases: ['essence', 'chakra', 'ce', 'chakraessence'],
  },

  expscroll: {
    id: 'expscroll', name: 'EXP Scroll', emoji: E.scroll, tradable: true,
    description: 'Grants EXP to a card.',
    db_col: 'exp_scrolls',
    aliases: ['expscroll', 'expscrolls', 'exp', 'scroll'],
  },

  fragment: {
    id: 'fragment', name: 'Fragment', emoji: E.fragment, tradable: true,
    description: 'Character-specific shards. Used for summon, mastery, and prestige.',
    db_col: null,  // stored in fragment_inventory table
    aliases: ['fragment', 'frag', 'frags', 'fragments'],
  },

  // ── Gacha Scrolls ─────────────────────────
  academy_scroll: {
    id: 'academy_scroll', name: 'Academy Scroll', emoji: '📜', tradable: false,
    description: 'Opens for low-tier card rewards.',
    db_col: 'academy_scrolls',
    aliases: ['academy_scroll', 'academyscroll', 'academy'],
  },

  chunin_scroll: {
    id: 'chunin_scroll', name: 'Chunin Scroll', emoji: '📜', tradable: false,
    description: 'Opens for mid-tier card rewards.',
    db_col: 'chunin_scrolls',
    aliases: ['chunin_scroll', 'chuninscroll', 'chunin'],
  },

  jonin_scroll: {
    id: 'jonin_scroll', name: 'Jonin Scroll', emoji: '📜', tradable: false,
    description: 'Opens for high-tier card rewards.',
    db_col: 'jonin_scrolls',
    aliases: ['jonin_scroll', 'joninscroll', 'jonin'],
  },

  anbu_scroll: {
    id: 'anbu_scroll', name: 'ANBU Scroll', emoji: '📜', tradable: false,
    description: 'Opens for top-tier card rewards.',
    db_col: 'anbu_scrolls',
    aliases: ['anbu_scroll', 'anbuscroll', 'anbu'],
  },

  hokage_scroll: {
    id: 'hokage_scroll', name: 'Hokage Scroll', emoji: '📜', tradable: false,
    description: 'Opens for the rarest card rewards.',
    db_col: 'hokage_scrolls',
    aliases: ['hokage_scroll', 'hokagescroll', 'hokage'],
  },

  mission_scroll: {
    id: 'mission_scroll', name: 'Mission Scroll', emoji: '📜', tradable: false,
    description: 'Awarded from completed missions.',
    db_col: 'mission_scrolls',
    aliases: ['mission_scroll', 'missionscroll', 'mission'],
  },

  // ── Trial Tickets ─────────────────────────
  academy_ticket: {
    id: 'academy_ticket', name: 'Academy Trial Ticket', emoji: '🎫', tradable: false,
    description: 'Grants entry to the Academy Trial (clearable ~floor 60).',
    db_col: 'academy_trial_tickets',
    aliases: ['academy_ticket', 'academyticket', 'academy_trial', 'trial1ticket'],
  },

  chunin_ticket: {
    id: 'chunin_ticket', name: 'Chunin Trial Ticket', emoji: '🎫', tradable: false,
    description: 'Grants entry to the Chunin Trial (clearable ~floor 50).',
    db_col: 'chunin_trial_tickets',
    aliases: ['chunin_ticket', 'chuninticket', 'chunin_trial', 'trial2ticket'],
  },

  jonin_ticket: {
    id: 'jonin_ticket', name: 'Jonin Trial Ticket', emoji: '🎫', tradable: false,
    description: 'Grants entry to the Jonin Trial (clearable ~floor 40).',
    db_col: 'jonin_trial_tickets',
    aliases: ['jonin_ticket', 'joninticket', 'jonin_trial', 'trial3ticket'],
  },

  anbu_ticket: {
    id: 'anbu_ticket', name: 'ANBU Trial Ticket', emoji: '🎫', tradable: false,
    description: 'Grants entry to the ANBU Trial (clearable ~floor 30).',
    db_col: 'anbu_trial_tickets',
    aliases: ['anbu_ticket', 'anbuticket', 'anbu_trial', 'trial4ticket'],
  },
};

/**
 * Look up an item by id or alias (case-insensitive).
 * Returns the item definition or null.
 */
function findItem(query) {
  const q = query.toLowerCase().trim();
  return Object.values(ITEMS).find(item =>
    item.id === q || item.aliases.includes(q)
  ) ?? null;
}

module.exports = { ITEMS, findItem };
