// ─────────────────────────────────────────────
//  battleEngine.js  —  Turn-based battle simulation
//
//  Combatant shape:
//  {
//    name     : string,
//    hp       : number,    ← max HP (also used as current HP initially)
//    atkMin   : number,
//    atkMax   : number,
//    spd      : number,    ← higher = acts first each round
//    critRate : number,    ← percentage (e.g. 20 = 20%)
//  }
//
//  Returns:
//  {
//    winner     : 'A' | 'B',
//    log        : string[],   ← condensed battle log
//    roundCount : number,
//  }
// ─────────────────────────────────────────────

const MAX_ROUNDS = 50; // safety cap to prevent infinite loops

/**
 * Roll damage for one attack.
 * @returns {{ damage: number, isCrit: boolean }}
 */
function rollDamage(atkMin, atkMax, critRate) {
  const base   = Math.floor(Math.random() * (atkMax - atkMin + 1)) + atkMin;
  const isCrit = Math.random() * 100 < critRate;
  return {
    damage: isCrit ? Math.floor(base * 1.5) : base,
    isCrit,
  };
}

/**
 * Runs a full battle between two teams.
 * Both teams are arrays of combatants (see shape above).
 * Alive combatants are tracked via currentHp.
 *
 * @param {Object[]} teamA
 * @param {Object[]} teamB
 * @returns {{ winner: 'A'|'B', log: string[], roundCount: number }}
 */
function simulateBattle(teamA, teamB) {
  // Deep-copy so we don't mutate originals
  const a = teamA.map(c => ({ ...c, currentHp: c.hp }));
  const b = teamB.map(c => ({ ...c, currentHp: c.hp }));

  const log        = [];
  let   roundCount = 0;

  const alive = arr => arr.filter(c => c.currentHp > 0);
  const pick  = arr => arr[Math.floor(Math.random() * arr.length)];

  while (alive(a).length > 0 && alive(b).length > 0 && roundCount < MAX_ROUNDS) {
    roundCount++;

    // Build turn order for this round: all alive combatants sorted by spd desc
    const turnOrder = [
      ...alive(a).map(c => ({ combatant: c, team: 'A' })),
      ...alive(b).map(c => ({ combatant: c, team: 'B' })),
    ].sort((x, y) => {
      // Speed desc; ties broken randomly
      if (y.combatant.spd !== x.combatant.spd) return y.combatant.spd - x.combatant.spd;
      return Math.random() < 0.5 ? -1 : 1;
    });

    for (const { combatant, team } of turnOrder) {
      if (combatant.currentHp <= 0) continue; // died this round

      const enemies  = team === 'A' ? alive(b) : alive(a);
      if (!enemies.length) break;

      const target   = pick(enemies);
      const { damage, isCrit } = rollDamage(combatant.atkMin, combatant.atkMax, combatant.critRate);
      target.currentHp = Math.max(0, target.currentHp - damage);

      const critTag = isCrit ? ' ✨CRIT' : '';
      log.push(
        `**Rd ${roundCount}** · **${combatant.name}** → **${target.name}**  ` +
        `\`${damage} dmg${critTag}\`  (HP: ${target.currentHp}/${target.hp})`
      );
    }
  }

  // Determine winner
  const aAlive = alive(a).length;
  const bAlive = alive(b).length;

  let winner;
  if (aAlive > bAlive)       winner = 'A';
  else if (bAlive > aAlive)  winner = 'B';
  else                       winner = roundCount >= MAX_ROUNDS ? 'B' : 'A'; // timeout = loss for player

  return { winner, log, roundCount };
}

/**
 * Convert a card + effectiveStats into a battle combatant object.
 * @param {string} name      — Display name
 * @param {Object} stats     — from getEffectiveStats()
 */
function makeCombatant(name, stats) {
  return {
    name,
    hp:       stats.hp,
    atkMin:   stats.atkMin,
    atkMax:   stats.atkMax,
    spd:      stats.spd,
    critRate: stats.critRate,
  };
}

module.exports = { simulateBattle, makeCombatant, rollDamage };
