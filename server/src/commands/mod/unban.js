/*
  Description: Removes a target ip from the ratelimiter
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (!server.unban(data.ip)) return server.replyWarn(`此IP地址没有被封禁`, socket)
  server.broadcastInfo(`${socket.nick} 解封了IP地址 ${data.ip}`)

  return true;
}

export const info = {
  name: 'unban',
  description: '解封一个IP地址',
  usage: `
    API: { cmd: 'unban', ip: '<target ip>' }
    以聊天形式发送 /unban 目标IP`,
  runByChat: true,
  dataRules: [
    {
      name: 'ip',
      required: true,
    }
  ],
  level: UAC.levels.moderator
};
