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

  if (server.findSockets({ address: badClient.address, level: l => l >= socket.level }).length > 0) return server.replyWarn(`有同级或更高等级的用户和目标用户共用一个IP地址`, socket)

  server.ban(badClient.address)
  
  server.broadcastInfo(`${socket.nick} 封禁了 ${targetNick}，目标IP：${badClient.address}`, { level: UAC.isModerator })
  server.broadcastInfo(`已封禁 ${targetNick}`, { joined: true, level: l => l < UAC.levels.moderator })

  // force connection closed
  badClient.terminate();
  return true;
}

export const info = {
  name: 'ban',
  description: '封禁一个用户',
  usage: `
    API: { cmd: 'ban', nick: '<target nickname>' }
    以聊天形式发送 /ban 目标用户`,
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
