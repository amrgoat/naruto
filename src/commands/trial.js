// ─────────────────────────────────────────────
//  trial.js  —  N trial1 / trial2 / trial3 / trial4
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
//  Configs live in /towerconfig/<difficulty>.json — nothing hardcoded.
// ─────────────────────────────────────────────

const {
  EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle,
} = require('discord.js');

const { q, giveExpToCard, trialTicketStatements } = require('../database');
const { CHARACTERS }        = require('../data/characters');
const { MASTERY, COLORS }   = require('../config');
const { checkRegistered }   = require('../utils/guards');
const { getEffectiveStats } = require('../utils/cardUtils');
const { resolvePassiveBonuses } = require('../utils/passives');
const { rollDamage }        = require('../utils/battleEngine');
const { loadConfig, buildEnemies, getFloorReward, getFloorMaxHp } = require('../utils/trialEngine');

// ── Active session store ───────────────────────
// Keyed by userId. Cleared on trial end / timeout.
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
      `🎫 You have **${ticket}** ${config.shortName} Trial Ticket${ticket !== 1 ? 's' : ''}.\n\n` +
      `**Skip Floors** — Your 2nd strongest card auto-clears floors whose enemies' HP ≤ its ATK.\n` +
      `All skipped rewards are granted normally.`
    )
    .addFields({
      name: '⚠️ Checkpoint Rules',
      value:
        '✅ Leave right after a boss → **100%** rewards\n' +
        '🚶 Leave between bosses → **50%** rewards\n' +
        '💀 Die between bosses → **25%** rewards',
    })
    .setFooter({ text: 'Starting consumes 1 Trial Ticket.' });
}

// ─────────────────────────────────────────────
//  Format a single combatant line (enemy or player)
// ─────────────────────────────────────────────
function fmtCombatant({ name, currentHp, maxHp, atkMin, atkMax, spd }) {
  const dead = currentHp <= 0;
  const hpBar = dead
    ? `❤️ 0/${maxHp.toLocaleString()} 💀 Defeated`
    : `❤️ ${currentHp.toLocaleString()}/${maxHp.toLocaleString()}  ⚡ ${spd}  ⚔️ ${atkMin}–${atkMax}`;
  return `**${name}**\n${hpBar}`;
}

// ─────────────────────────────────────────────
//  Build the main battle embed
// ─────────────────────────────────────────────
function buildBattleEmbed(session) {
  const { config, currentFloor, enemies, players, rewards, log, atSafeExit } = session;
  const isBoss = currentFloor % 5 === 0;

  // Checkpoint status for footer
  let checkpointNote;
  if (atSafeExit) {
    checkpointNote = '✅ Safe Exit — Leave now for 100% rewards';
  } else if (session.lastBossFloor > 0) {
    checkpointNote = `⚠️ Quit = 50% · Die = 25% (checkpoint: floor ${session.lastBossFloor})`;
  } else {
    checkpointNote = '⚠️ No checkpoint yet · Quit = 50% · Die = 25%';
  }

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(
      `${config.emoji} ${config.name} — Floor ${currentFloor}/100` +
      (isBoss ? '  ⚡ **BOSS**' : '')
    )
    .setFooter({
      text: [
        `🪙 ${rewards.ryo.toLocaleString()} Ryo`,
        `✨ ${rewards.chakra.toLocaleString()} Chakra`,
        `📜 ${rewards.exp.toLocaleString()} EXP`,
        rewards.ramen > 0 ? `🍜 ${rewards.ramen} Ramen` : null,
        checkpointNote,
      ].filter(Boolean).join('  |  '),
    });

  if (log) embed.setDescription(log);

  // Enemy field
  const enemyLines = enemies.map(e => fmtCombatant(e)).join('\n\n');
  embed.addFields({
    name: isBoss ? '👹 Boss' : `⚔️ Enemy Squad (${enemies.filter(e => e.currentHp > 0).length} alive)`,
    value: enemyLines || '—',
  });

  // Player team field
  const playerLines = players.map(p => fmtCombatant(p)).join('\n\n');
  embed.addFields({
    name: `🥷 Your Team (${players.filter(p => p.currentHp > 0).length} alive)`,
    value: playerLines || '—',
  });

  return embed;
}

// ─────────────────────────────────────────────
//  Build team-select buttons (phase: select_card)
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
      .setLabel('🚪 Leave')
      .setStyle(ButtonStyle.Danger)
  );

  return [new ActionRowBuilder().addComponents(buttons)];
}

// ─────────────────────────────────────────────
//  Build enemy-select buttons (phase: select_enemy)
// ─────────────────────────────────────────────
function buildEnemyButtons(session) {
  const { enemies } = session;

  const buttons = enemies.map((e, i) =>
    new ButtonBuilder()
      .setCustomId(`trial_enemy_${i}`)
      .setLabel(e.name.length > 20 ? e.name.slice(0, 18) + '…' : e.name)
      .setStyle(e.currentHp <= 0 ? ButtonStyle.Secondary : ButtonStyle.Danger)
      .setDisabled(e.currentHp <= 0)
  );

  buttons.push(
    new ButtonBuilder()
      .setCustomId('trial_cancel')
      .setLabel('← Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return [new ActionRowBuilder().addComponents(buttons)];
}

// ─────────────────────────────────────────────
//  Load a floor into the session (enemies, reset attacker)
// ─────────────────────────────────────────────
function loadFloor(session, floor) {
  session.currentFloor  = floor;
  session.enemies       = buildEnemies(session.config, floor);
  session.lastAttackerIdx = null;
  session.phase         = 'select_card';
}

// ─────────────────────────────────────────────
//  Resolve one attack exchange
//  Returns a log string describing what happened.
// ─────────────────────────────────────────────
function resolveCombat(attacker, defender) {
  // Speed comparison — higher speed goes first
  const playerFirst = attacker.spd >= defender.spd;

  let log = '';

  if (playerFirst) {
    // Player attacks first
    const { damage: dmg1, isCrit: c1 } = rollDamage(attacker.atkMin, attacker.atkMax, attacker.critRate ?? 10);
    defender.currentHp = Math.max(0, defender.currentHp - dmg1);
    log += `⚔️ **${attacker.name}** → **${defender.name}**: \`${dmg1.toLocaleString()} dmg${c1 ? ' ✨CRIT' : ''}\` (HP: ${defender.currentHp.toLocaleString()}/${defender.maxHp.toLocaleString()})`;

    // Defender only retaliates if alive
    if (defender.currentHp > 0) {
      const { damage: dmg2, isCrit: c2 } = rollDamage(defender.atkMin, defender.atkMax, defender.critRate ?? 10);
      attacker.currentHp = Math.max(0, attacker.currentHp - dmg2);
      log += `\n💢 **${defender.name}** → **${attacker.name}**: \`${dmg2.toLocaleString()} dmg${c2 ? ' ✨CRIT' : ''}\` (HP: ${attacker.currentHp.toLocaleString()}/${attacker.maxHp.toLocaleString()})`;
    } else {
      log += `\n💨 **${defender.name}** was defeated before it could retaliate.`;
    }
  } else {
    // Defender (enemy) is faster — attacks first
    const { damage: dmg1, isCrit: c1 } = rollDamage(defender.atkMin, defender.atkMax, defender.critRate ?? 10);
    attacker.currentHp = Math.max(0, attacker.currentHp - dmg1);
    log += `💢 **${defender.name}** is faster! → **${attacker.name}**: \`${dmg1.toLocaleString()} dmg${c1 ? ' ✨CRIT' : ''}\` (HP: ${attacker.currentHp.toLocaleString()}/${attacker.maxHp.toLocaleString()})`;

    // Player card retaliates if alive
    if (attacker.currentHp > 0) {
      const { damage: dmg2, isCrit: c2 } = rollDamage(attacker.atkMin, attacker.atkMax, attacker.critRate ?? 10);
      defender.currentHp = Math.max(0, defender.currentHp - dmg2);
      log += `\n⚔️ **${attacker.name}** → **${defender.name}**: \`${dmg2.toLocaleString()} dmg${c2 ? ' ✨CRIT' : ''}\` (HP: ${defender.currentHp.toLocaleString()}/${defender.maxHp.toLocaleString()})`;
    } else {
      log += `\n💀 **${attacker.name}** was taken down before counter-attacking.`;
    }
  }

  return log;
}

// ─────────────────────────────────────────────
//  Apply accumulated rewards to the database
// ─────────────────────────────────────────────
function applyRewards(userId, rewards, multiplier) {
  const scale = r => Math.floor(r * multiplier);
  const ryo     = scale(rewards.ryo);
  const chakra  = scale(rewards.chakra);
  const exp     = scale(rewards.exp);
  const ramen   = scale(rewards.ramen);

  if (ryo    > 0) q.addRyo.run(ryo, userId);
  if (chakra > 0) q.addChakraEssence.run(chakra, userId);
  if (exp    > 0) q.addExpScrolls.run(exp, userId);
  if (ramen  > 0) q.addRamen.run(ramen, userId);

  return { ryo, chakra, exp, ramen };
}

// ─────────────────────────────────────────────
//  End the trial — show final result embed
// ─────────────────────────────────────────────
async function endTrial(session, reason, collector) {
  const { userId, config, currentFloor, rewards, atSafeExit } = session;
  activeSessions.delete(userId);
  collector.stop('ended');

  // Determine multiplier
  let multiplier, reasonText, color;
  if (reason === 'floor100') {
    multiplier  = 1.0;
    reasonText  = '🏆 **Floor 100 Cleared!** You conquered the entire Trial!';
    color       = COLORS.success;
  } else if (reason === 'safeExit' || (reason === 'leave' && atSafeExit)) {
    multiplier  = 1.0;
    reasonText  = '✅ **Safe Exit** — Boss checkpoint reached. Full rewards granted!';
    color       = COLORS.success;
  } else if (reason === 'leave') {
    multiplier  = 0.5;
    reasonText  = `🚶 **Retreat** — You left on floor ${currentFloor}. **50%** of rewards granted.`;
    color       = COLORS.warning;
  } else {
    // death
    multiplier  = 0.25;
    reasonText  = `💀 **Team Defeated** on floor ${currentFloor}. **25%** of rewards granted.`;
    color       = COLORS.error;
  }

  const final = applyRewards(userId, rewards, multiplier);

  // Give EXP to surviving team cards as a bonus
  for (const p of session.players) {
    if (p.cardId && p.currentHp > 0) {
      const cardExp = Math.floor((rewards.exp * multiplier) / session.players.length);
      if (cardExp > 0) giveExpToCard(p.cardId, cardExp, MASTERY);
    }
  }

  const resultEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${config.emoji} ${config.name} — Ended`)
    .setDescription(reasonText)
    .addFields(
      { name: '📊 Final Floor',  value: `Floor **${currentFloor}** / 100`, inline: true },
      { name: '🪙 Ryo Earned',   value: final.ryo.toLocaleString(), inline: true },
      { name: '✨ Chakra',        value: final.chakra.toLocaleString(), inline: true },
      { name: '📜 EXP Scrolls',  value: final.exp.toLocaleString(), inline: true },
      ...(final.ramen > 0 ? [{ name: '🍜 Ramen', value: String(final.ramen), inline: true }] : []),
      {
        name: '💡 Rewards were',
        value: multiplier === 1 ? '**100%** (full)' : multiplier === 0.5 ? '**50%** of accumulated' : '**25%** of accumulated',
        inline: true,
      }
    );

  await session.message.edit({ embeds: [resultEmbed], components: [] }).catch(() => {});
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
          .setTitle('🏯 Trial Difficulties')
          .setDescription(
            '`N trial1` — 📚 **Academy Trial**  *(clearable ~floor 60 · lowest rewards)*\n' +
            '`N trial2` — 🟦 **Chunin Trial**   *(clearable ~floor 50)*\n' +
            '`N trial3` — 🟧 **Jonin Trial**    *(clearable ~floor 40)*\n' +
            '`N trial4` — 🔴 **ANBU Trial**     *(clearable ~floor 30 · highest rewards)*\n\n' +
            'Each run consumes one Trial Ticket of the matching difficulty.'
          )],
      });
    }

    // ── Registration check ────────────────────
    const user = checkRegistered(message);
    if (!user) return;

    // ── No concurrent sessions ────────────────
    if (activeSessions.has(userId)) {
      return message.reply({ content: '⚠️ You already have an active Trial. Finish or leave it first.' });
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
    const teamRows  = q.getTeam.all(userId);
    const pb        = resolvePassiveBonuses(userId);
    const passives  = { hpPct: pb.hpPct, flatSpd: pb.flatSpd };

    // Build player combatant list (combat cards only)
    const players = teamRows
      .filter(card => {
        const char = CHARACTERS[card.character_id];
        return char && char.type !== 'Support';
      })
      .map(card => {
        const char  = CHARACTERS[card.character_id];
        const stats = getEffectiveStats(card, passives);
        return {
          cardId:   card.id,
          name:     char.name,
          maxHp:    stats.hp,
          currentHp: stats.hp,
          atkMin:   stats.atkMin,
          atkMax:   stats.atkMax,
          spd:      stats.spd,
          critRate: char.critRate,
        };
      });

    if (!players.length) {
      return message.reply({ content: '⚠️ You need at least 1 combat card in your team to enter a Trial.' });
    }

    // ── Send start embed ──────────────────────
    const startEmbed = buildStartEmbed(config, user);
    const startRow   = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('trial_start')
        .setLabel('▶ Start Trial')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('trial_skip')
        .setLabel('⏭ Skip Floors')
        .setStyle(ButtonStyle.Primary),
    );

    const msg = await message.reply({ embeds: [startEmbed], components: [startRow] });

    // ── Session skeleton (populated on start) ─
    const session = {
      userId, difficulty, config, message: msg,
      players, currentFloor: 1, enemies: [],
      rewards:        { ryo: 0, chakra: 0, exp: 0, ramen: 0 },
      lastBossFloor:  0,
      atSafeExit:     false,
      lastAttackerIdx: null,
      phase:           'AWAITING_START',
      selectedCardIdx: null,
      log:             '',
    };
    activeSessions.set(userId, session);

    // ── Main collector ────────────────────────
    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time:   30 * 60 * 1000,  // 30-minute session timeout
    });

    // ─────────────────────────────────────────
    //  Helper: refresh the battle embed + buttons
    // ─────────────────────────────────────────
    async function refreshBattle(interaction) {
      const embed   = buildBattleEmbed(session);
      const buttons = session.phase === 'select_enemy'
        ? buildEnemyButtons(session)
        : buildTeamButtons(session);
      await interaction.update({ embeds: [embed], components: buttons });
    }

    // ─────────────────────────────────────────
    //  Helper: begin the actual battle at the session's currentFloor
    // ─────────────────────────────────────────
    async function beginBattle(interaction) {
      // Consume ticket (safe: prepared statement prevents SQL injection)
      trialTicketStatements[config.ticketCol].deduct.run(1, userId);

      loadFloor(session, session.currentFloor);
      session.phase = 'select_card';

      const embed   = buildBattleEmbed(session);
      const buttons = buildTeamButtons(session);
      await interaction.update({ embeds: [embed], components: buttons });
    }

    // ─────────────────────────────────────────
    //  COLLECTOR HANDLER
    // ─────────────────────────────────────────
    collector.on('collect', async interaction => {
      const { customId } = interaction;

      // ── AWAITING START buttons ──────────────
      if (session.phase === 'AWAITING_START') {

        if (customId === 'trial_start') {
          session.currentFloor = 1;
          await beginBattle(interaction);
          return;
        }

        if (customId === 'trial_skip') {
          // Calculate skip power from 2nd-strongest combat card
          const sortedByAtk = [...players].sort((a, b) => {
            const aMid = (a.atkMin + a.atkMax) / 2;
            const bMid = (b.atkMin + b.atkMax) / 2;
            return bMid - aMid;
          });

          const skipPower = sortedByAtk.length >= 2
            ? Math.floor((sortedByAtk[1].atkMin + sortedByAtk[1].atkMax) / 2)
            : 0;

          // Fast-forward through skippable floors
          let startFloor = 1;
          let skippedCount = 0;

          if (skipPower > 0) {
            for (let f = 1; f <= 100; f++) {
              const maxHp = getFloorMaxHp(config, f);
              if (maxHp > skipPower) {
                startFloor = f;
                break;
              }
              // Grant rewards for this floor
              accumulateReward(session, f);
              if (f % 5 === 0) {
                session.lastBossFloor = f;
              }
              skippedCount++;
              if (f === 100) startFloor = 101; // cleared everything
            }
          }

          if (startFloor > 100) {
            // Skipped all floors — full clear
            await endTrial(session, 'floor100', collector);
            return;
          }

          session.log = skippedCount > 0
            ? `⏭️ Skipped **${skippedCount}** floor${skippedCount !== 1 ? 's' : ''} ` +
              `(skip power: **${skipPower.toLocaleString()}** ATK). Starting at **floor ${startFloor}**.`
            : `⏭️ Skip power (**${skipPower.toLocaleString()}** ATK) not enough to skip floor 1. Starting normally.`;

          session.currentFloor = startFloor;
          // atSafeExit = true if we just skipped onto a boss floor (skippedCount's last was boss)
          session.atSafeExit = session.lastBossFloor === startFloor - 1 && startFloor > 1;
          await beginBattle(interaction);
          return;
        }

        return; // Ignore unrecognised buttons in this phase
      }

      // ── LEAVE ──────────────────────────────
      if (customId === 'trial_leave') {
        const reason = session.atSafeExit ? 'safeExit' : 'leave';
        await endTrial(session, reason, collector);
        return;
      }

      // ── CARD SELECTION phase ───────────────
      if (session.phase === 'select_card' && customId.startsWith('trial_card_')) {
        const idx = parseInt(customId.split('_')[2], 10);
        const player = session.players[idx];

        // Safety: dead card or on cooldown
        if (!player || player.currentHp <= 0) return interaction.deferUpdate().catch(() => {});

        const livingCount = session.players.filter(p => p.currentHp > 0).length;
        if (session.lastAttackerIdx === idx && livingCount > 1) return interaction.deferUpdate().catch(() => {});

        session.selectedCardIdx = idx;
        session.phase = 'select_enemy';
        session.atSafeExit = false; // any attack commitment leaves safe exit

        await refreshBattle(interaction);
        return;
      }

      // ── CANCEL (back to card select) ───────
      if (customId === 'trial_cancel') {
        session.phase = 'select_card';
        session.selectedCardIdx = null;
        await refreshBattle(interaction);
        return;
      }

      // ── ENEMY SELECTION phase ──────────────
      if (session.phase === 'select_enemy' && customId.startsWith('trial_enemy_')) {
        const enemyIdx = parseInt(customId.split('_')[2], 10);
        const enemy    = session.enemies[enemyIdx];
        const attacker = session.players[session.selectedCardIdx];

        // Safety checks
        if (!enemy || enemy.currentHp <= 0 || !attacker) return interaction.deferUpdate().catch(() => {});

        // Resolve the attack
        session.log = resolveCombat(attacker, enemy);
        session.lastAttackerIdx = session.selectedCardIdx;
        session.selectedCardIdx = null;
        session.phase = 'select_card';

        // Check outcomes
        const allEnemiesDead  = session.enemies.every(e => e.currentHp <= 0);
        const allPlayersDead  = session.players.every(p => p.currentHp <= 0);

        if (allEnemiesDead) {
          // ── Floor cleared ────────────────────
          const clearedFloor = session.currentFloor;
          accumulateReward(session, clearedFloor);

          if (clearedFloor === 100) {
            // Full clear — update embed briefly then end
            session.log += '\n\n🏆 **Floor 100 conquered! Trial Complete!**';
            await refreshBattle(interaction);
            await endTrial(session, 'floor100', collector);
            return;
          }

          // Unlock safe exit when a boss floor is cleared
          if (clearedFloor % 5 === 0) {
            session.lastBossFloor = clearedFloor;
            session.atSafeExit   = true;
          }

          const nextFloor = clearedFloor + 1;
          loadFloor(session, nextFloor);

          session.log +=
            `\n\n✅ **Floor ${clearedFloor} cleared!** ` +
            (session.atSafeExit ? '✅ Safe Exit available — or continue to floor ' : 'Advancing to floor ') +
            `**${nextFloor}**…`;

          await refreshBattle(interaction);
          return;
        }

        if (allPlayersDead) {
          // ── Team wiped ───────────────────────
          session.log += '\n\n💀 **All team members defeated!**';
          await refreshBattle(interaction);
          await endTrial(session, 'death', collector);
          return;
        }

        // Normal — continue
        await refreshBattle(interaction);
        return;
      }
    }); // end collector.on('collect')

    // ── Timeout cleanup ───────────────────────
    collector.on('end', async (_, reason) => {
      if (reason === 'ended') return; // clean exit handled by endTrial
      // Timed out or external stop
      activeSessions.delete(userId);
      const timeoutEmbed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${config.emoji} ${config.name} — Timed Out`)
        .setDescription('⏰ The trial session expired due to inactivity.\n**0%** of rewards granted — ticket already consumed.');
      await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    });
  },
};
