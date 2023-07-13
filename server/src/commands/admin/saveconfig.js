/*
  Description: Writes the current config to disk
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket) {
  // attempt save, notify of failure
  if (!core.configManager.save()) {
    return server.reply({
      cmd: 'warn',
      text: '无法手动保存配置文件，请检查日志',
    }, socket);
  }

  // return success message to moderators and admins
  server.broadcast({
    cmd: 'info',
    text: '已手动保存配置文件',
  }, { level: UAC.isModerator });

  return true;
}

export const info = {
  name: 'saveconfig',
  description: '手动保存配置文件',
  usage: `
    API: { cmd: 'saveconfig' }
    以聊天形式发送 /saveconfig`,
  runByChat: true,
  dataRules: [],
  level: UAC.levels.admin,
};
