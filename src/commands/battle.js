// ─────────────────────────────────────────────
//  battle.js  —  N battle @user
//  Friendly battle between two players.
//  No EXP, Ryo, or ranking changes. For fun only.
//  Passive bonuses (Choji HP, Rock Lee SPD) apply
//  for each player's own cards.
// ─────────────────────────────────────────────

const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { q }                    = require('../database');
const { CHARACTERS }           = require('../data/characters');
const { COLORS, E }            = require('../config');
const { checkRegistered }      = require('../utils/guards');
const { getEffectiveStats }    = require('../utils/cardUtils');
const { simulateBattle, makeCombatant } = require('../utils/battleEngine');
const { resolvePassiveBonuses }  = require('../utils/passives');
const { errorEmbed }           = require('../utils/embeds');

module.exports = {
  name: 'battle',
  description: 'Challenge a friend · N battle @user',

  async execute(message, args) {
    const challenger = checkRegistered(message);
    if (!challenger) return;

    // ── Mention check ──────────────────────────
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply({ embeds: [errorEmbed('Usage: `N battle @user`')] });
    }
    if (target.bot) {
      return message.reply({ embeds: [errorEmbed("You can't challenge a bot.")] });
    }
    if (target.id === message.author.id) {
      return message.reply({ embeds: [errorEmbed("You can't battle yourself.")] });
    }

    // ── Target must be registered ──────────────
    const targetUser = q.getUser.get(target.id);
    if (!targetUser) {
      return message.reply({
        embeds: [errorEmbed(`**${target.username}** hasn't started yet. They need to run \`N start\`.`)],
      });
    }

    // ── Both need teams ────────────────────────
    const challengerTeam = q.getTeam.all(message.author.id);
    if (!challengerTeam.length) {
      return message.reply({ embeds: [errorEmbed("You need cards in your team. Use `N team add <name>`.")] });
    }

    // ── Send challenge ─────────────────────────
    const challengeEmbed = new EmbedBuilder()
      .setColor(COLORS.arena)
      .setTitle(`${E.battle} Battle Challenge!`)
      .setDescription(
        `**${message.author.username}** has challenged **${target.username}** to a friendly battle!\n\n` +
        `No EXP or Ryo is awarded — this is for honor only.`
      )
      .setFooter({ text: 'Challenge expires in 60 seconds.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('battle_accept')
        .setLabel('⚔️  Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('battle_decline')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Secondary),
    );

    const reply = await message.reply({
      content:    `${target}`,
      embeds:     [challengeEmbed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === target.id,
      time:   60_000,
      max:    1,
    });

    collector.on('collect', async interaction => {
      // ── Declined ────────────────────────────
      if (interaction.customId === 'battle_decline') {
        return interaction.update({
          content: null,
          embeds: [new EmbedBuilder()
            .setColor(COLORS.info)
            .setDescription(`**${target.username}** declined the challenge.`)],
          components: [],
        });
      }

      // ── Check target's team ──────────────────
      const freshTargetTeam = q.getTeam.all(target.id);
      if (!freshTargetTeam.length) {
        return interaction.update({
          content: null,
          embeds:  [errorEmbed(`**${target.username}** doesn't have any cards in their team.`)],
          components: [],
        });
      }

      // ── Resolve passive bonuses per player ───
      const challengerPB = resolvePassiveBonuses(message.author.id);
      const targetPB     = resolvePassiveBonuses(target.id);

      // ── Build combatants with passives ───────
      const toFighters = (cards, pb) => cards.map(card => {
        const char  = CHARACTERS[card.character_id];
        const stats = getEffectiveStats(card, { hpPct: pb.hpPct, flatSpd: pb.flatSpd });
        return makeCombatant(char.name, stats);
      });

      const { winner, log, roundCount } = simulateBattle(
        toFighters(challengerTeam, challengerPB),
        toFighters(freshTargetTeam, targetPB),
      );

      const winnerName = winner === 'A' ? message.author.username : target.username;
      const loserName  = winner === 'A' ? target.username         : message.author.username;

      // Battle log (first 10 rounds)
      const logDisplay = log.slice(0, 10);
      if (log.length > 10) logDisplay.push(`*...+${log.length - 10} more rounds*`);

      const resultEmbed = new EmbedBuilder()
        .setColor(COLORS.arena)
        .setTitle(`${E.battle} Battle Result`)
        .setDescription(logDisplay.join('\n') || '*No rounds recorded.*')
        .addFields(
          { name: `${E.win} Winner`,  value: `**${winnerName}**`, inline: true },
          { name: `${E.loss} Defeated`, value: `**${loserName}**`, inline: true },
          { name: 'Rounds',            value: `${roundCount}`,     inline: true },
        )
        .setFooter({ text: 'Friendly battle — no rewards' });

      return interaction.update({
        content:    null,
        embeds:     [resultEmbed],
        components: [],
      });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        reply.edit({
          content: null,
          embeds:  [new EmbedBuilder()
            .setColor(COLORS.info)
            .setDescription(`The battle challenge expired — **${target.username}** did not respond.`)],
          components: [],
        }).catch(() => {});
      }
    });
  },
};
