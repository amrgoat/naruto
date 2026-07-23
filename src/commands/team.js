// ─────────────────────────────────────────────
//  team.js  —  N team | N team add | N team remove
//  Manage your 4-card battle team.
// ─────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const { q }            = require('../database');
const { CHARACTERS }   = require('../data/characters');
const { COLORS, E }    = require('../config');
const { checkRegistered } = require('../utils/guards');
const { getEffectiveStats, starsDisplay, rarityBadge, formatAtk } = require('../utils/cardUtils');
const { errorEmbed, successEmbed } = require('../utils/embeds');

const MAX_TEAM = 4;

/** Find a card the user owns by character name substring */
function findCard(userId, query) {
  const lq = query.toLowerCase();
  return q.getUserCards.all(userId).find(c => {
    const char = CHARACTERS[c.character_id];
    return (
      char?.name.toLowerCase().includes(lq) ||
      c.character_id.toLowerCase().replace(/_/g, ' ').includes(lq)
    );
  });
}

/** Build the team display embed */
function buildTeamEmbed(userId, username) {
  const teamCards = q.getTeam.all(userId);

  const lines = [];
  for (let slot = 1; slot <= MAX_TEAM; slot++) {
    const tc   = teamCards.find(c => c.slot === slot);
    if (!tc) {
      lines.push(`**Slot ${slot}** — *Empty*`);
      continue;
    }
    const char  = CHARACTERS[tc.character_id];
    const stats = getEffectiveStats(tc);
    const stars = starsDisplay(tc.stars);
    lines.push(
      `**Slot ${slot}** — ${rarityBadge(char.rarity)} **${char.name}**` +
      `  M${tc.mastery} Lv.${tc.level}${stars ? `  ${stars}` : ''}\n` +
      `\u2003${E.attack} ${formatAtk(stats.atkMin, stats.atkMax)}  ${E.health} ${stats.hp}  ${E.speed} ${stats.spd}`
    );
  }

  return new EmbedBuilder()
    .setColor(COLORS.EMBED_COLOR)
    .setTitle(`${E.team} ${username}'s Team`)
    .setDescription(lines.join('\n\n') || '*No cards in team.*')
    .setFooter({ text: `${teamCards.length} / ${MAX_TEAM} slots filled  ·  N team add <name>` });
}

module.exports = {
  name: 'team',
  description: 'View/manage your team · N team | N team add <name> | N team remove <name>',

  async execute(message, args) {
    const user = checkRegistered(message);
    if (!user) return;

    const userId  = message.author.id;
    const name    = message.member?.displayName ?? message.author.username;
    const sub     = args[0]?.toLowerCase();

    // ── N team ─────────────────────────────────
    if (!sub) {
      return message.reply({ embeds: [buildTeamEmbed(userId, name)] });
    }

    const cardQuery = args.slice(1).join(' ');

    // ── N team add <name> ──────────────────────
    if (sub === 'add') {
      if (!cardQuery) return message.reply({ embeds: [errorEmbed('Usage: `N team add <character name>`')] });

      const card = findCard(userId, cardQuery);
      if (!card) return message.reply({ embeds: [errorEmbed(`You don't own a card matching \`${cardQuery}\`.`)] });

      const char = CHARACTERS[card.character_id];

      // Support cards cannot battle
      if (char.type === 'Support') {
        return message.reply({
          embeds: [errorEmbed(
            `**${char.name}** is a Support card and cannot join a battle team.\n` +
            `Their passive is active just by owning them.`
          )],
        });
      }

      // Duplicate character on team?
      const dupeCheck = q.teamHasCharacter.get(userId, card.character_id);
      if (dupeCheck) {
        return message.reply({ embeds: [errorEmbed(`**${char.name}** is already on your team.`)] });
      }

      // Team full?
      const size = q.teamSize.get(userId);
      if (size.count >= MAX_TEAM) {
        return message.reply({
          embeds: [errorEmbed(
            `Your team is full (${MAX_TEAM}/${MAX_TEAM}).\n` +
            `Remove a card first with \`N team remove <name>\`.`
          )],
        });
      }

      // Find next available slot
      const teamCards  = q.getTeam.all(userId);
      const usedSlots  = new Set(teamCards.map(c => c.slot));
      let   nextSlot   = null;
      for (let s = 1; s <= MAX_TEAM; s++) {
        if (!usedSlots.has(s)) { nextSlot = s; break; }
      }

      q.addToTeam.run(userId, card.id, nextSlot);

      return message.reply({
        embeds: [successEmbed(
          `${rarityBadge(char.rarity)} **${char.name}** added to **Slot ${nextSlot}**.\n` +
          `Team: ${size.count + 1} / ${MAX_TEAM}`
        )],
      });
    }

    // ── N team remove <name> ───────────────────
    if (sub === 'remove') {
      if (!cardQuery) return message.reply({ embeds: [errorEmbed('Usage: `N team remove <character name>`')] });

      const teamCards = q.getTeam.all(userId);
      const lq = cardQuery.toLowerCase();
      const tc = teamCards.find(c => {
        const char = CHARACTERS[c.character_id];
        return (
          char?.name.toLowerCase().includes(lq) ||
          c.character_id.toLowerCase().replace(/_/g, ' ').includes(lq)
        );
      });

      if (!tc) {
        return message.reply({
          embeds: [errorEmbed(`**${cardQuery}** is not on your team.`)],
        });
      }

      const char = CHARACTERS[tc.character_id];
      q.removeFromTeamByCard.run(userId, tc.id);

      return message.reply({
        embeds: [successEmbed(`**${char.name}** has been removed from your team.`)],
      });
    }

    // Unknown subcommand
    return message.reply({
      embeds: [errorEmbed('Usage: `N team` · `N team add <name>` · `N team remove <name>`')],
    });
  },
};
