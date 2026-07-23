// ─────────────────────────────────────────────
//  admin/backup.js  —  N backup
//  Manually trigger a database backup.
//  Owner only.
// ─────────────────────────────────────────────

const { isOwner }    = require('../../utils/owner');
const { sendBackup } = require('../../utils/backup');

module.exports = {
  name: 'backup',
  description: '[Admin] Send a manual DB backup · N backup',

  async execute(message, _args, client) {
    if (!isOwner(message.author.id)) return;

    await message.reply({ content: '📦 Sending backup…' });
    await sendBackup(client, 'Manual');
  },
};
