/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (core.config.mods.includes(data.trip)) return server.replyWarn('目标用户已经是管理员了', socket)
  core.config.mods.push(data.trip)

  server.findSockets({ trip: data.trip }).forEach(s => {
    s.level = UAC.levels.moderator
    s.uType = 'mod'
  })

  server.broadcastInfo(`已添加管理员：${data.trip}`, { level: UAC.isModerator })
  
  if (!core.configManager.save()) {
    server.replyWarn(`无法保存配置文件`)
  }
}

export const info = {
  name: 'addmod',
  description: '添加一名管理员',
  usage: `
    API: { cmd: 'addmod', trip: '<target trip>' }
    以聊天形式发送 /addmod 识别码`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      required: true,
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
    },
  ],
  level: UAC.levels.admin
};
