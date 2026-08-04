// ─────────────────────────────────────────────
//  trial.js  —  n trial1 / trial2 / trial3 / trial4
//
//  One-message interactive dungeon crawler.
//  Everything happens inside a single Discord embed
//  that is continuously edited — no new messages sent.
//
//  Difficulties:
//    trial1 → Academy  (clearable ~floor 60, lowest rewards)
//    trial2 → Chunin   (clearable ~floor 50)
//    trial3 → Jonin    (clearable ~floor 40)
//    trial4 → ANBU     (clearable ~floor 30, highest rewards)
//
//  Each trial consumes one Trial Ticket on start.
//  Configs live in src/config.js (TOWER_CONFIGS) — nothing hardcoded.
// ─────────────────────────────────────────────

const {
  EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle,
} = require('discord.js');

const { q, giveExpToCard, trialTicketStatements, scrollStatements } = require('../database');
const { CHARACTERS }        = require('../data/characters');
const { MASTERY, COLORS, E, COMBAT_EMOJIS, SCROLL_EMOJIS } = require('../config');
const { checkRegistered }   = require('../utils/guards');
const { getEffectiveStats } = require('../utils/cardUtils');
const { resolvePassiveBonuses } = require('../utils/passives');
const { rollDamage }        = require('../utils/battleEngine');
const { loadConfig, buildEnemies, getFloorReward, getFloorMaxHp } = require('../utils/trialEngine');
const { buildHpBar }        = require('../utils/hpBar');

// ── Active session store ───────────────────────
const activeSessions = new Map();

// ── Difficulty map ─────────────────────────────
const DIFFICULTY_KEYS = { 1: 'academy', 2: 'chunin', 3: 'jonin', 4: 'anbu' };

// ── Ticket column map ──────────────────────────
const TICKET_COLS = {
  academy: 'academy_trial_tickets',
  chunin:  'chunin_trial_tickets',
  jonin:   'jonin_trial_tickets',
  anbu:    'anbu_trial_tickets',
};

// ── Scroll columns tracked in rewards ─────────
const SCROLL_COLS = ['academy_scrolls', 'chunin_scrolls', 'jonin_scrolls', 'anbu_scrolls'];
const SCROLL_NAMES = {
  academy_scrolls: 'Academy Scroll',
  chunin_scrolls:  'Chunin Scroll',
  jonin_scrolls:   'Jonin Scroll',
  anbu_scrolls:    'ANBU Scroll',
};


// ─────────────────────────────────────────────
//  Format a single combatant line
//  isPlayer = true → show Lv / M / P info
// ─────────────────────────────────────────────
function fmtCombatant(c, isPlayer = false) {
  if (c.currentHp <= 0) {
    const meta = isPlayer
      ? ` | Lv ${c.level ?? '?'}${c.mastery ? ` | M${c.mastery}` : ''}${c.prestige ? ` | P${c.prestige}` : ''}`
      : ` | Lv ${c.level ?? '?'}`;
    return `${E.loss} ~~**${c.name}**${meta}~~`;
  }

  const meta = isPlayer
    ? ` | Lv ${c.level ?? '?'}${c.mastery ? ` | M${c.mastery}` : ''}${c.prestige ? ` | P${c.prestige}` : ''}`
    : ` | Lv ${c.level ?? '?'}`;

  const stats = `${COMBAT_EMOJIS.health} ${c.currentHp.toLocaleString()}/${c.maxHp.toLocaleString()} | ${COMBAT_EMOJIS.speed} ${c.spd} | ${COMBAT_EMOJIS.attack} ${c.atkMin.toLocaleString()}–${c.atkMax.toLocaleString()}`;
  const bar   = buildHpBar(c.currentHp, c.maxHp);
  return `${E.arrow} **${c.name}**${meta}\n${stats}\n${bar}`;
}

// ─────────────────────────────────────────────
//  Build the start embed
// ─────────────────────────────────────────────
function buildStartEmbed(config, user) {
  const ticket = user[config.ticketCol] ?? 0;
  return new EmbedBuilder()
    .setColor(config.color)
    .setTitle(`${config.emoji} ${config.name}`)
    .setDescription(
      `**100 floors** of escalating enemies await.\n` +
      `Every 5th floor is a boss battle.\n\n` +
      `${E.ticket} You have **${ticket}** ${config.shortName} Trial Ticket${ticket !== 1 ? 's' : ''}.\n\n` +
      `**Skip Floors** — Your 2nd strongest card auto-clears floors whose enemies' HP ≤ its ATK.\n` +
      `All skipped rewards are granted normally.`
    )
    .addFields({
      name: `${E.warn} Checkpoint Rules`,
      value:
        `${E.check} After a boss (or on a 5n+1 floor) → **100%** rewards\n` +
        `${E.walk} Leave mid-floor elsewhere → **50%** rewards\n` +
        `${E.loss} Die → **25%** rewards`,
    })
    .setFooter({ text: 'Starting consumes 1 Trial Ticket.' });
}

// ─────────────────────────────────────────────
//  Build the main battle embed
// ─────────────────────────────────────────────
function buildBattleEmbed(session) {
  const { config, currentFloor, enemies, players, atSafeExit, lastBossFloor } = session;
  const isBoss    = currentFloor % 5 === 0;
  const isPostBoss = currentFloor % 5 === 1 && currentFloor > 1;

  let checkpointNote;
  if (atSafeExit || isPostBoss) {
    checkpointNote = `${E.check} Safe Exit — Leave now for 100% rewards`;
  } else if (lastBossFloor > 0) {
    checkpointNote = `${E.warn} Quit = 50% · Die = 25%  (last boss: floor ${lastBossFloor})`;
  } else {
    checkpointNote = `${E.warn} No checkpoint yet — Quit = 50% · Die = 25%`;
  }

  const enemyHeader  = isBoss ? '**===== Boss =====**' : '**===== Enemies =====**';
  const enemyLines   = enemies.map(e => fmtCombatant(e, false)).join('\n\n');
  const playerHeader = '**===== Your Team =====**';
  const playerLines  = players.map(p => fmtCombatant(p, true)).join('\n\n');

  const description = `${enemyHeader}\n${enemyLines}\n\n${playerHeader}\n${playerLines}`;

  return new EmbedBuilder()
    .setColor(config.color)
    .setTitle(
      `${config.emoji} ${config.name} — Floor ${currentFloor}/100` +
      (isBoss ? `  ${E.boss} BOSS` : '')
    )
    .setDescription(description)
    .setFooter({ text: checkpointNote });
}

// ─────────────────────────────────────────────
//  Build team-select buttons (only phase now)
// ─────────────────────────────────────────────
function buildTeamButtons(session) {
  const { players, lastAttackerIdx } = session;
  const livingCount = players.filter(p => p.currentHp > 0).length;

  const buttons = players.map((p, i) => {
    const dead     = p.currentHp <= 0;
    const cooldown = !dead && lastAttackerIdx === i && livingCount > 1;
    return new ButtonBuilder()
      .setCustomId(`trial_card_${i}`)
      .setLabel(p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name)
      .setStyle(dead || cooldown ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setDisabled(dead || cooldown);
  });

  buttons.push(
    new ButtonBuilder()
      .setCustomId('trial_leave')
      .setLabel(`${E.door} Leave`)
      .setStyle(ButtonStyle.Danger)
  );

  return [new ActionRowBuilder().addComponents(buttons)];
}

// ─────────────────────────────────────────────
//  Load a floor into the session
// ─────────────────────────────────────────────
function loadFloor(session, floor) {
  session.currentFloor    = floor;
  session.enemies         = buildEnemies(session.config, floor);
  session.lastAttackerIdx = null;
  session.phase           = 'select_card';
}

// ─────────────────────────────────────────────
//  Resolve one attack exchange (mutates HP)
// ─────────────────────────────────────────────
function resolveCombat(attacker, defender) {
  const playerFirst = attacker.spd >= defender.spd;

  if (playerFirst) {
    const { damage: dmg1 } = rollDamage(attacker.atkMin, attacker.atkMax, attacker.critRate ?? 10);
    defender.currentHp = Math.max(0, defender.currentHp - dmg1);
    if (defender.currentHp > 0) {
      const { damage: dmg2 } = rollDamage(defender.atkMin, defender.atkMax, defender.critRate ?? 10);
      attacker.currentHp = Math.max(0, attacker.currentHp - dmg2);
    }
  } else {
    const { damage: dmg1 } = rollDamage(defender.atkMin, defender.atkMax, defender.critRate ?? 10);
    attacker.currentHp = Math.max(0, attacker.currentHp - dmg1);
    if (attacker.currentHp > 0) {
      const { damage: dmg2 } = rollDamage(attacker.atkMin, attacker.atkMax, attacker.critRate ?? 10);
      defender.currentHp = Math.max(0, defender.currentHp - dmg2);
    }
  }
}

// ─────────────────────────────────────────────
//  Accumulate one floor's reward into the session
// ─────────────────────────────────────────────
function accumulateReward(session, floor) {
  const reward = getFloorReward(session.config, floor);
  session.rewards.ryo    += reward.ryo    ?? 0;
  session.rewards.chakra += reward.chakra ?? 0;
  session.rewards.exp    += reward.exp    ?? 0;
  session.rewards.ramen  += reward.ramen  ?? 0;
  for (const col of SCROLL_COLS) {
    session.rewards[col] = (session.rewards[col] ?? 0) + (reward[col] ?? 0);
  }
}

// ─────────────────────────────────────────────
//  Apply accumulated rewards to the database
//  Returns the final integer amounts given.
// ─────────────────────────────────────────────
function applyRewards(userId, rewards, multiplier) {
  const fl = v => Math.floor(v * multiplier);

  const ryo    = fl(rewards.ryo);
  const chakra = fl(rewards.chakra);
  const exp    = fl(rewards.exp);
  const ramen  = fl(rewards.ramen);

  if (ryo    > 0) q.addRyo.run(ryo, userId);
  if (chakra > 0) q.addChakraEssence.run(chakra, userId);
  if (exp    > 0) q.addExpScrolls.run(exp, userId);
  if (ramen  > 0) q.addRamen.run(ramen, userId);

  const scrollsGiven = {};
  for (const col of SCROLL_COLS) {
    const count = Math.floor((rewards[col] ?? 0) * multiplier);
    scrollsGiven[col] = count;
    if (count > 0 && scrollStatements[col]) {
      scrollStatements[col].add.run(count, userId);
    }
  }

  return { ryo, chakra, exp, ramen, scrolls: scrollsGiven };
}

// ─────────────────────────────────────────────
//  Build the reward description list (like screenshot)
// ─────────────────────────────────────────────
function buildRewardLines(final) {
  const lines = [];
  if (final.ryo    > 0) lines.push(`${E.coin} **${final.ryo.toLocaleString()}** Ryo`);
  if (final.chakra > 0) lines.push(`${E.essence} **${final.chakra.toLocaleString()}** Chakra Essence`);
  if (final.exp    > 0) lines.push(`${E.scroll} **${final.exp.toLocaleString()}** EXP Scrolls`);
  if (final.ramen  > 0) lines.push(`${E.ramen} **${final.ramen}** Ramen`);
  for (const col of SCROLL_COLS) {
    const n = final.scrolls?.[col] ?? 0;
    if (n > 0) lines.push(`${SCROLL_EMOJIS[col]} **${n}** ${SCROLL_NAMES[col]}${n > 1 ? 's' : ''}`);
  }
  return lines.length ? lines.join('\n') : '*No rewards this run.*';
}

// ─────────────────────────────────────────────
//  End the trial — show final result embed
// ─────────────────────────────────────────────
async function endTrial(session, reason, collector) {
  const { userId, config, currentFloor, rewards, atSafeExit } = session;
  activeSessions.delete(userId);
  collector.stop('ended');

  const isPostBoss = currentFloor % 5 === 1 && currentFloor > 1;

  let multiplier, headline, color;

  if (reason === 'floor100') {
    multiplier = 1.0;
    headline   = `${E.win} **Floor 100 Cleared!** You conquered the entire Trial!`;
    color      = COLORS.success;
  } else if (reason === 'safeExit' || (reason === 'leave' && (atSafeExit || isPostBoss))) {
    multiplier = 1.0;
    headline   = `${E.check} **You escaped on floor ${currentFloor}** and received **100%** of your loot!`;
    color      = COLORS.success;
  } else if (reason === 'leave') {
    multiplier = 0.5;
    headline   = `${E.walk} **You retreated on floor ${currentFloor}** and received **50%** of your loot.`;
    color      = COLORS.warning;
  } else {
    multiplier = 0.25;
    headline   = `${E.loss} **Defeated on floor ${currentFloor}.** You recovered **25%** of your loot.`;
    color      = COLORS.error;
  }

  // On a 5n+1 floor, accumulate this floor's reward so the player gets credit
  // for the work done on the current floor (even mid-floor) at 100% payout.
  if (isPostBoss && (reason === 'leave' || reason === 'safeExit')) {
    accumulateReward(session, currentFloor);
  }

  const final       = applyRewards(userId, rewards, multiplier);
  const rewardLines = buildRewardLines(final);

  // Give EXP to surviving player cards as a bonus
  for (const p of session.players) {
    if (p.cardId && p.currentHp > 0) {
      const cardExp = Math.floor((rewards.exp * multiplier) / session.players.length);
      if (cardExp > 0) giveExpToCard(p.cardId, cardExp, MASTERY);
    }
  }

  const resultEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${config.emoji} ${config.name} — Ended`)
    .setDescription(`${headline}\n\n${rewardLines}`);
  if (config.thumbnail) resultEmbed.setThumbnail(config.thumbnail);

  // Remove buttons from the battle embed, leave it visible
  await session.message.edit({ components: [] }).catch(() => {});
  // Send rewards as a separate follow-up message
  await session.message.reply({ embeds: [resultEmbed] }).catch(() => {});
}

// ─────────────────────────────────────────────
//  COMMAND ENTRY POINT
// ─────────────────────────────────────────────
module.exports = {
  name:    'trial',
  aliases: ['trial1', 'trial2', 'trial3', 'trial4'],

  async execute(message, args) {
    const userId = message.author.id;

    // ── Parse difficulty ──────────────────────
    const raw = message.content.toLowerCase();
    let diffNum = null;
    for (const n of [1, 2, 3, 4]) {
      if (raw.includes(`trial${n}`)) { diffNum = n; break; }
    }
    if (!diffNum && args[0]) diffNum = parseInt(args[0], 10);

    if (!diffNum || !DIFFICULTY_KEYS[diffNum]) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.info)
          .setTitle(`${E.tower} Trial Difficulties`)
          .setDescription(
            `\`n trial1\` — ${E.book} **Academy Trial**  *(clearable ~floor 60 · lowest rewards)*\n` +
            `\`n trial2\` — ${E.blue} **Chunin Trial**   *(clearable ~floor 50)*\n` +
            `\`n trial3\` — ${E.orange} **Jonin Trial**    *(clearable ~floor 40)*\n` +
            `\`n trial4\` — ${E.red} **ANBU Trial**     *(clearable ~floor 30 · highest rewards)*\n\n` +
            'Each run consumes one Trial Ticket of the matching difficulty.'
          )],
      });
    }

    // ── Registration check ────────────────────
    const user = checkRegistered(message);
    if (!user) return;

    // ── No concurrent sessions ────────────────
    if (activeSessions.has(userId)) {
      return message.reply({ content: `${E.warn} You already have an active Trial. Finish or leave it first.` });
    }

    const difficulty = DIFFICULTY_KEYS[diffNum];
    const config     = loadConfig(difficulty);

    // ── Ticket check ──────────────────────────
    const ticketCount = user[config.ticketCol] ?? 0;
    if (ticketCount <= 0) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle(`${config.emoji} No Tickets`)
          .setDescription(
            `You don't have any **${config.name} Tickets**.\n` +
            `Earn them from missions, events, or the shop.`
          )],
      });
    }

    // ── Team check ────────────────────────────
    const teamRows = q.getTeam.all(userId);
    const pb       = resolvePassiveBonuses(userId);
    const passives = { hpPct: pb.hpPct, flatSpd: pb.flatSpd };

    const players = teamRows
      .filter(card => {
        const char = CHARACTERS[card.character_id];
        return char && char.type !== 'Support';
      })
      .map(card => {
        const char  = CHARACTERS[card.character_id];
        const stats = getEffectiveStats(card, passives);
        return {
          cardId:    card.id,
          name:      char.name,
          level:     card.level ?? 1,
          mastery:   card.mastery ?? 1,
          prestige:  card.prestige_stars ?? 0,
          maxHp:     stats.hp,
          currentHp: stats.hp,
          atkMin:    stats.atkMin,
          atkMax:    stats.atkMax,
          spd:       stats.spd,
          critRate:  char.critRate,
        };
      });

    if (!players.length) {
      return message.reply({ content: `${E.warn} You need at least 1 combat card in your team to enter a Trial.` });
    }

    // ── Send start embed ──────────────────────
    const startEmbed = buildStartEmbed(config, user);
    const startRow   = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('trial_start')
        .setLabel(`${E.play} Start Trial`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('trial_skip')
        .setLabel(`${E.skip} Skip Floors`)
        .setStyle(ButtonStyle.Primary),
    );

    const msg = await message.reply({ embeds: [startEmbed], components: [startRow] });

    // ── Session skeleton ──────────────────────
    const session = {
      userId, difficulty, config, message: msg,
      players,
      currentFloor:    1,
      enemies:         [],
      rewards: {
        ryo: 0, chakra: 0, exp: 0, ramen: 0,
        academy_scrolls: 0, chunin_scrolls: 0, jonin_scrolls: 0, anbu_scrolls: 0,
      },
      lastBossFloor:   0,
      atSafeExit:      false,
      lastAttackerIdx: null,
      phase:           'AWAITING_START',
    };
    activeSessions.set(userId, session);

    // ── Main collector ────────────────────────
    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time:   30 * 60 * 1000,
    });

    // ─────────────────────────────────────────
    //  Refresh the battle embed + buttons
    // ─────────────────────────────────────────
    async function refreshBattle(interaction) {
      const embed   = buildBattleEmbed(session);
      const buttons = buildTeamButtons(session);
      await interaction.update({ embeds: [embed], components: buttons });
    }

    // ─────────────────────────────────────────
    //  Begin the actual battle at session.currentFloor
    // ─────────────────────────────────────────
    async function beginBattle(interaction) {
      trialTicketStatements[config.ticketCol].deduct.run(1, userId);
      loadFloor(session, session.currentFloor);
      await refreshBattle(interaction);
    }

    // ─────────────────────────────────────────
    //  COLLECTOR HANDLER
    // ─────────────────────────────────────────
    collector.on('collect', async interaction => {
      const { customId } = interaction;

      // ── AWAITING START ──────────────────────
      if (session.phase === 'AWAITING_START') {

        if (customId === 'trial_start') {
          session.currentFloor = 1;
          await beginBattle(interaction);
          return;
        }

        if (customId === 'trial_skip') {
          const sortedByAtk = [...players].sort((a, b) =>
            ((b.atkMin + b.atkMax) / 2) - ((a.atkMin + a.atkMax) / 2)
          );
          const skipPower = sortedByAtk.length >= 2
            ? Math.floor((sortedByAtk[1].atkMin + sortedByAtk[1].atkMax) / 2)
            : 0;

          let startFloor = 1;
          let skippedCount = 0;

          if (skipPower > 0) {
            for (let f = 1; f <= 100; f++) {
              const maxHp = getFloorMaxHp(config, f);
              if (maxHp > skipPower) { startFloor = f; break; }
              accumulateReward(session, f);
              if (f % 5 === 0) session.lastBossFloor = f;
              skippedCount++;
              if (f === 100) startFloor = 101;
            }
          }

          if (startFloor > 100) {
            // Skipped everything
            await interaction.deferUpdate().catch(() => {});
            await endTrial(session, 'floor100', collector);
            return;
          }

          session.currentFloor = startFloor;
          session.atSafeExit   = session.lastBossFloor === startFloor - 1 && startFloor > 1;
          await beginBattle(interaction);
          return;
        }

        return;
      }

      // ── LEAVE ──────────────────────────────
      if (customId === 'trial_leave') {
        const reason = session.atSafeExit ? 'safeExit' : 'leave';
        await interaction.deferUpdate().catch(() => {});
        await endTrial(session, reason, collector);
        return;
      }

      // ── CARD SELECTION — auto-attack first living enemy ──
      if (session.phase === 'select_card' && customId.startsWith('trial_card_')) {
        const idx    = parseInt(customId.split('_')[2], 10);
        const player = session.players[idx];

        if (!player || player.currentHp <= 0) {
          return interaction.deferUpdate().catch(() => {});
        }
        const livingCount = session.players.filter(p => p.currentHp > 0).length;
        if (session.lastAttackerIdx === idx && livingCount > 1) {
          return interaction.deferUpdate().catch(() => {});
        }

        // Auto-select first living enemy
        const enemy = session.enemies.find(e => e.currentHp > 0);
        if (!enemy) return interaction.deferUpdate().catch(() => {});

        // Committing to attack — clear safe exit
        session.atSafeExit = false;

        // Resolve combat
        resolveCombat(player, enemy);
        session.lastAttackerIdx = idx;

        const allEnemiesDead = session.enemies.every(e => e.currentHp <= 0);
        const allPlayersDead = session.players.every(p => p.currentHp <= 0);

        if (allEnemiesDead) {
          // ── Floor cleared ──────────────────
          const clearedFloor = session.currentFloor;
          accumulateReward(session, clearedFloor);

          if (clearedFloor === 100) {
            await refreshBattle(interaction);
            await endTrial(session, 'floor100', collector);
            return;
          }

          if (clearedFloor % 5 === 0) {
            session.lastBossFloor = clearedFloor;
            session.atSafeExit   = true;
          }

          const nextFloor = clearedFloor + 1;
          loadFloor(session, nextFloor);
          await refreshBattle(interaction);
          return;
        }

        if (allPlayersDead) {
          await refreshBattle(interaction);
          await endTrial(session, 'death', collector);
          return;
        }

        await refreshBattle(interaction);
        return;
      }
    });

    // ── Timeout cleanup ───────────────────────
    collector.on('end', async (_, reason) => {
      if (reason === 'ended') return;
      activeSessions.delete(userId);
      const timeoutEmbed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${config.emoji} ${config.name} — Timed Out`)
        .setDescription(`${E.clock} The trial session expired due to inactivity.\n**0%** of rewards granted — ticket already consumed.`);
      await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    });
  },
};
