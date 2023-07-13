/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (!core.config.mods.includes(data.trip)) return server.replyWarn('目标用户不是管理员', socket)
  core.config.mods = core.config.mods.filter(t => t !== data.trip)

  server.findSockets({ trip: data.trip }).forEach(s => {
    s.level = UAC.levels.default
    s.uType = 'user'
    server.replyInfo(`已删除您的管理员权限`, s)
  })

  server.broadcastInfo(`已删除管理员：${data.trip}`, { level: UAC.isModerator })

  if (!core.configManager.save()) {
    server.replyWarn(`无法保存配置文件`)
  }
}

export const info = {
  name: 'removemod',
  description: '删除一名管理员',
  usage: `
    API: { cmd: 'removemod', trip: '<target trip>' }
    以聊天形式发送 /removemod 识别码`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      required: true,
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
    },
  ],
};
