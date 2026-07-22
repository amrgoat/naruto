// ─────────────────────────────────────────────
//  arena.js  —  N arena
//  Fight AI-controlled bot teams.
//  Choose: Easy | Normal | Hard | Extreme
//  10 attempts per day · resets at 12:00 AM IST
//  Both wins and losses consume an attempt.
//  All team cards earn EXP after every battle.
//
//  Passives:
//   · Baki      — must own to unlock Arena
//   · Iruka     — +10/20/40% Arena EXP
//   · Choji     — +HP% to your cards
//   · Rock Lee  — +flat SPD to your cards
//
//  Uses custom combat emojis in result embeds.
// ─────────────────────────────────────────────

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');
const { q, giveExpToCard }   = require('../database');
const { CHARACTERS }         = require('../data/characters');
const {
  COLORS, E, COMBAT_EMOJIS,
  ARENA_DIFFICULTIES, ARENA_ATTEMPTS_PER_DAY, MASTERY,
} = require('../config');
const { checkRegistered }    = require('../utils/guards');
const { getEffectiveStats, rarityBadge, starsDisplay } = require('../utils/cardUtils');
const { simulateBattle, makeCombatant } = require('../utils/battleEngine');
const { resolvePassiveBonuses }  = require('../utils/passives');
const { errorEmbed }         = require('../utils/embeds');
const { todayISTMidnightUTC, formatCountdown } = require('../utils/timeUtils');

module.exports = {
  name: 'arena',
  description: 'Battle AI teams for EXP and Ryo · N arena',

  async execute(message) {
    const userId = message.author.id;
    let user = checkRegistered(message);
    if (!user) return;

    // ── Passive bonuses (gate + bonuses) ───────
    const pb = resolvePassiveBonuses(userId);

    // ── Baki gate ──────────────────────────────
    if (!pb.unlockArena) {
      return message.reply({
        embeds: [errorEmbed(
          'The Arena is locked.\nObtain **Baki** to unlock it.'
        )],
      });
    }

    const now = Date.now();

    // ── Daily reset check ──────────────────────
    const todayMidnight = todayISTMidnightUTC(now);
    if (user.arena_reset_at < todayMidnight) {
      q.resetArena.run(todayMidnight, userId);
      user = q.getUser.get(userId);
    }

    // ── No attempts left ───────────────────────
    if (user.arena_attempts <= 0) {
      const nextMidnight = todayMidnight + 24 * 60 * 60 * 1000;
      return message.reply({
        embeds: [errorEmbed(
          `You have no Arena attempts left today.\n` +
          `Resets in **${formatCountdown(nextMidnight - now)}**.`
        )],
      });
    }

    // ── Team check ─────────────────────────────
    const teamCards = q.getTeam.all(userId);
    if (!teamCards.length) {
      return message.reply({
        embeds: [errorEmbed(
          `You need at least 1 card in your team to enter the Arena.\n` +
          `Use \`N team add <name>\` to build your squad.`
        )],
      });
    }

    // ── Difficulty selector ────────────────────
    const selectorEmbed = new EmbedBuilder()
      .setColor(COLORS.arena)
      .setTitle(`${E.arena} Arena`)
      .setDescription(
        `**${user.arena_attempts}** / **${ARENA_ATTEMPTS_PER_DAY}** attempts remaining.\n\n` +
        `Choose your difficulty. Win or lose, you'll earn rewards.` +
        (pb.arenaExpBonus > 0
          ? `\n\n> Iruka passive: **+${Math.round(pb.arenaExpBonus * 100)}% EXP**`
          : '')
      );

    const menu = new StringSelectMenuBuilder()
      .setCustomId('arena_difficulty')
      .setPlaceholder('Select difficulty...')
      .addOptions(
        Object.entries(ARENA_DIFFICULTIES).map(([key, d]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${d.emoji} ${d.label}`)
            .setDescription(d.description)
            .setValue(key)
        )
      );

    const row  = new ActionRowBuilder().addComponents(menu);
    const reply = await message.reply({ embeds: [selectorEmbed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === userId && i.customId === 'arena_difficulty',
      time:   60_000,
      max:    1,
    });

    collector.on('collect', async interaction => {
      const diffKey = interaction.values[0];
      const diff    = ARENA_DIFFICULTIES[diffKey];

      // Re-verify attempt count
      const freshUser = q.getUser.get(userId);
      if (freshUser.arena_attempts <= 0) {
        return interaction.update({
          embeds: [errorEmbed('No attempts remaining.')], components: [],
        });
      }

      // ── Consume attempt ──────────────────────
      q.consumeArena.run(userId);

      // ── Build combatants (with passive bonuses) ──
      const passiveBonuses = { hpPct: pb.hpPct, flatSpd: pb.flatSpd };
      const playerCombatants = teamCards.map(card => {
        const char  = CHARACTERS[card.character_id];
        const stats = getEffectiveStats(card, passiveBonuses);
        return makeCombatant(char.name, stats);
      });

      const aiCombatants = diff.enemies.map(e => makeCombatant(e.name, e));

      // ── Simulate ─────────────────────────────
      const { winner, log, roundCount } = simulateBattle(playerCombatants, aiCombatants);
      const playerWon = winner === 'A';

      // ── Rewards (Iruka EXP bonus) ─────────────
      const baseExp   = playerWon ? diff.exp.win : diff.exp.loss;
      const expReward = Math.floor(baseExp * (1 + pb.arenaExpBonus));
      const ryoReward = playerWon ? diff.ryo.win : diff.ryo.loss;

      // Give EXP to all team cards
      for (const card of teamCards) {
        giveExpToCard(card.id, expReward, MASTERY);
      }
      q.addRyo.run(ryoReward, userId);

      // ── Battle log (condensed) ────────────────
      const logDisplay = log.slice(0, 8);
      if (log.length > 8) logDisplay.push(`*...+${log.length - 8} more rounds*`);

      // ── Enemy team summary ────────────────────
      const enemySummary = diff.enemies
        .map(e => `\`Lv.${e.level}\` ${e.name}`)
        .join('\n');

      const updatedUser = q.getUser.get(userId);

      const expLabel = pb.arenaExpBonus > 0
        ? `**+${expReward.toLocaleString()}** *(+${Math.round(pb.arenaExpBonus * 100)}% Iruka)*`
        : `**+${expReward.toLocaleString()}**`;

      const resultEmbed = new EmbedBuilder()
        .setColor(playerWon ? COLORS.success : COLORS.error)
        .setTitle(playerWon
          ? `${E.win} Victory! — ${diff.emoji} ${diff.label}`
          : `${E.loss} Defeat — ${diff.emoji} ${diff.label}`)
        .addFields(
          {
            name:   '🤖 Enemy Team',
            value:  enemySummary,
            inline: true,
          },
          {
            name:   `${COMBAT_EMOJIS.attack} EXP / card`,
            value:  expLabel,
            inline: true,
          },
          {
            name:   `${COMBAT_EMOJIS.ryo} Ryo`,
            value:  `**+${ryoReward.toLocaleString()}** (total: ${updatedUser.ryo.toLocaleString()})`,
            inline: true,
          },
          {
            name:   `${E.arena} Attempts`,
            value:  `**${updatedUser.arena_attempts}** / ${ARENA_ATTEMPTS_PER_DAY} remaining`,
            inline: true,
          },
        )
        .setFooter({ text: `Battle ended in ${roundCount} round${roundCount !== 1 ? 's' : ''}` });

      if (logDisplay.length) {
        resultEmbed.setDescription(logDisplay.join('\n'));
      }

      return interaction.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') reply.edit({ components: [] }).catch(() => {});
    });
  },
};
