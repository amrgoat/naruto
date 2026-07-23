// ─────────────────────────────────────────────
//  owner.js  —  Owner check utility
// ─────────────────────────────────────────────

const OWNER_ID = '631428835405070347';

/**
 * Returns true if the given Discord user ID is the bot owner.
 * @param {string} userId
 */
function isOwner(userId) {
  return userId === OWNER_ID;
}

module.exports = { isOwner, OWNER_ID };
