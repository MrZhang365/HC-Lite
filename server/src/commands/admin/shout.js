/*
  Description: Emmits a server-wide message as `info`
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // send text to all channels
  server.broadcast({
    cmd: 'info',
    text: `站长广播：\n${data.text}`,
  }, { joined: true });

  return true;
}

export const info = {
  name: 'shout',
  description: '向全体用户广播',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }
    以聊天形式发送 /shout 信息`,
  runByChat: true,
  dataRules: [
    {
      name: 'text',
      required: true,
      all: true,
    }
  ],
  level: UAC.levels.admin,
};
