// ─────────────────────────────────────────────
//  help.js  —  N help  (categorised embed)
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { COLORS }       = require('../config');

module.exports = {
  name: 'help',
  description: 'Show all commands.',

  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('Naruto Bot — Commands')
      .setColor(COLORS.default)
      .setDescription('Use prefix **N** before every command.')
      .addFields(
        {
          name: 'General',
          value: [
            '`N help`    — show this menu',
            '`N start`   — create your ninja account',
            '`N profile` — view your stats',
            '`N daily`   — claim daily Ryo, Ramen & Chakra Essence',
            '`N ramen`   — use 1 Ramen to restore all 12 pulls',
            '`N ping`    — check bot latency',
          ].join('\n'),
        },
        {
          name: 'Collection',
          value: [
            '`N pull`         — pull a random card',
            '`N cards`        — browse your card collection',
            '`N all`          — browse every character in the roster',
            '`N ci <name>`    — look up any character\'s base info & passive',
            '`N mci <name>`   — view your card with full stats & active passives',
          ].join('\n'),
        },
        {
          name: 'Team',
          value: [
            '`N team`               — view your active team',
            '`N team add <name>`    — add card to team',
            '`N team remove <name>` — remove card from team',
          ].join('\n'),
        },
        {
          name: 'Progression',
          value: [
            '`N mastery <card>`  — upgrade card mastery (M1 → M2 → M3)',
            '`N prestige <card>` — prestige a maxed card for a star',
            '`N lab`             — craft fragments with Chakra Essence (requires Orochimaru)',
          ].join('\n'),
        },
        {
          name: 'Battle',
          value: [
            '`N arena`        — fight in the arena (requires Baki)',
            '`N battle @user` — challenge another player',
          ].join('\n'),
        },
        {
          name: 'Passives (own the card to activate)',
          value: [
            '**Baki** — unlocks the Arena',
            '**Konohamaru** — bonus Ryo from N daily',
            '**Teuchi** — bonus Ramen from N daily',
            '**Tsunade** — 1% jackpot chance on N daily',
            '**Orochimaru** — unlocks the Lab + duplicate → Essence (M3)',
            '**Iruka** — bonus Arena EXP',
            '**Choji** — +HP% for all your cards',
            '**Rock Lee** — +Speed for all your cards',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Tip: Npull also works as a shortcut for N pull!' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};
