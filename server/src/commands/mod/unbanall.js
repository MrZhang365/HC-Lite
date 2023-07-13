/*
  Description: Clears all bans and ratelimits
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket) {
  server.unbanall()

  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 解封了所有IP地址`,
  }, { level: UAC.isModerator });

  return true;
}

export const info = {
  name: 'unbanall',
  description: '解封所有IP地址',
  usage: `
    API: { cmd: 'unbanall' }
    以聊天形式发送 /unbanall`,
  runByChat: true,
  dataRules: [],
  level: UAC.levels.moderator,
};
