// ─────────────────────────────────────────────
//  items/index.js  —  All bot item definitions
//
//  tradable: true  → can be traded between players (future trade system)
//  tradable: false → soul-bound, stays with the player who earned it
// ─────────────────────────────────────────────

const { COMBAT_EMOJIS, E } = require('../config');

const ITEMS = {
  ryo: {
    id:          'ryo',
    name:        'Ryo',
    emoji:       COMBAT_EMOJIS.ryo,               // <:ryo:...>
    tradable:    true,
    description: 'The primary currency of the ninja world. Used in the shop and crafting.',
    db_col:      'ryo',
    aliases:     ['ryo', 'gold', 'money', 'coins'],
  },

  ramen: {
    id:          'ramen',
    name:        'Ramen',
    emoji:       E.ramen,                          // 🍜
    tradable:    false,
    description: 'Ichiraku\'s finest. Restores 12 pulls instantly.',
    db_col:      'ramen',
    aliases:     ['ramen', 'noodles', 'food'],
  },

  essence: {
    id:          'essence',
    name:        'Chakra Essence',
    emoji:       COMBAT_EMOJIS.essence,            // <:essence:...>
    tradable:   true,   // soul-bound — earned through battle & duplicates
    description: 'Crystallised chakra earned from duplicates and battles. Used in crafting.',
    db_col:      'chakra_essence',
    aliases:     ['essence', 'chakra', 'ce'],
  },

  expscroll: {
    id:          'expscroll',
    name:        'EXP Scroll',
    emoji:       E.scroll,                         // 📜
    tradable:    true,
    description: 'A scroll imbued with training knowledge. Grants EXP to a card.',
    db_col:      'exp_scrolls',
    aliases:     ['expscroll', 'scroll', 'exp', 'expscrolls'],
  },

  fragment: {
    id:          'fragment',
    name:        'Fragment',
    emoji:       E.fragment,                       // 💎
    tradable:    true,   // soul-bound — character-specific, used for summon/mastery/prestige
    description: 'Character-specific shards. Collect 15 to summon a card via N summon.',
    db_col:      null,    // stored in fragment_inventory table, not users
    aliases:     ['fragment', 'frag', 'frags', 'fragments'],
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
