/*
  Description: Outputs the current command module list or command categories
*/

// module main
export async function run(core, server, socket, payload) {
  // check for spam
  if (server.police.frisk(socket.address, 2)) {
    return server.replyWarn(`您请求帮助的速度太快了，请稍后再试`, socket)
  }

  let reply = '';
  if (typeof payload.command === 'undefined') {
    reply += '# 命令列表：\n|分类：|名称：|\n|---:|---|\n';

    const categories = core.commands.categoriesList.sort();
    for (let i = 0, j = categories.length; i < j; i += 1) {
      reply += `|${categories[i].replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}:|`;
      const catCommands = core.commands.all(categories[i]).sort((a, b) => a.info.name.localeCompare(b.info.name));
      reply += `${catCommands.map((c) => `${c.info.name}`).join(', ')}|\n`;
    }

    reply += '---\n要获取指定命令的帮助，请使用：\n以聊天形式发送 `/help 命令名称`\nAPI: `{cmd: \'help\', command: \'<command name>\'}`';
  } else {
    const command = core.commands.get(payload.command);

    if (typeof command === 'undefined') {
      reply += '未知的命令，请执行 `/help` 来获取全部命令';
    } else {
      reply += `# ${command.info.name} 命令：\n| | |\n|---:|---|\n`;
      reply += `|**名称：**|${command.info.name}|\n`;
      reply += `|**别名：**|${typeof command.info.aliases !== 'undefined' ? command.info.aliases.join(', ') : '¯\\\\\\_(ツ)\\_/¯'}|\n`;
      reply += `|**分类：**|${command.info.category.replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}|\n`;
      reply += `|**必要的参数：**|${Array.isArray(command.info.dataRules) ? command.info.dataRules.map(r => r.name).join(', ') : '¯\\\\\\_(ツ)\\_/¯'}|\n`;
      reply += `|**介绍：**|${command.info.description || '¯\\\\\\_(ツ)\\_/¯'}|\n\n`;
      reply += `**用法：** ${command.info.usage || '¯\\\\\\_(ツ)\\_/¯'}`;
    }
  }

  // output reply
  server.replyInfo(reply, socket);

  return true;
}

export const info = {
  name: 'help',
  description: '显示所有命令列表或指定命令的帮助信息',
  usage: `
    API: { cmd: 'help', command: '<optional command name>' }
    以聊天形式发送 /help 命令名称（选填）`,
  runByChat: true,
  dataRules: [
    {
      name: 'command',
      verify: command => !(typeof command !== 'undefined' && typeof command !== 'string'),
      errorMessage: '你管这叫命令名称？'
    },
  ],
};