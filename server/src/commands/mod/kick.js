/*
  Description: Adds the target socket's ip to the ratelimiter
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // find target user
  const targetNick = data.nick;
  let badClient = server.findSockets({ nick: targetNick })[0];

  if (!badClient) {
    return server.replyWarn(`找不到目标用户`, socket)
  }

  if (badClient.level >= socket.level) return server.replyWarn(`目标用户和您平级或比您级别更高`, socket)
  
  server.broadcastInfo(`${socket.nick} 踢出了 ${targetNick}`, { level: UAC.isModerator })
  server.broadcastInfo(`已踢出 ${targetNick}`, { joined: true, level: l => l < UAC.levels.moderator })

  // force connection closed
  badClient.terminate();

  core.stats.increment('users-kicked')
  
  return true;
}

export const info = {
  name: 'kick',
  description: '踢出一个用户',
  usage: `
    API: { cmd: 'kick', nick: '<target nickname>' }
    以聊天形式发送 /kick 目标用户`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick,
      required: true,
    }
  ],
  level: UAC.levels.moderator,
};
