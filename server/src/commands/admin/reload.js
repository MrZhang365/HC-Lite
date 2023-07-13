/*
  Description: Clears and resets the command modules, outputting any errors
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // do command reload and store results
  let loadResult = core.dynamicImports.reloadDirCache();
  loadResult += core.commands.loadCommands();

  // clear and rebuild all module hooks
  server.loadHooks();

  // build reply based on reload results
  if (loadResult === '') {
    loadResult = `已重载 ${core.commands.commands.length} 个命令`;
  } else {
    loadResult = `已重载 ${core.commands.commands.length} 个命令，错误信息：
      ${loadResult}`;
  }

  if (typeof data.reason !== 'undefined') {
    loadResult += `\n原因：${data.reason}`;
  }

  // send results to moderators (which the user using this command is higher than)
  server.broadcast({
    cmd: 'info',
    text: loadResult,
  }, { level: UAC.isModerator });

  return true;
}

export const info = {
  name: 'reload',
  description: '重载所有命令，并输出错误信息（如果有）',
  usage: `
    API: { cmd: 'reload', reason: '<optional reason append>' }
    以聊天形式发送 /reload 可选的原因`,
  level: UAC.levels.admin,
  runByChat: true,
  dataRules: [
    {
      name: 'reason',
      all: true
    }
  ],
};
