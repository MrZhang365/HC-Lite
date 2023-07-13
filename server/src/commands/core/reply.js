/*
  Description: Display text on targets screen that only they can see
*/

export async function run(core, server, socket, payload) {
  if (typeof socket.whisperReply !== 'string') return server.replyWarn(`还没有人对您发送私信，快去发起私信吧！`, socket)
  await core.commands.handleCommand(server, socket, {
    cmd: 'whisper',
    nick: socket.whisperReply,
    text: payload.text,
  })
}

export const info = {
  name: 'reply',
  aliases: ['r'],
  description: '向某人发送私信',
  usage: `
    API: { cmd: 'whisper', nick: '<target name>', text: '<text to whisper>' }
    以聊天形式发送 /whisper 目标昵称 信息
    以聊天形式发送 /w 目标昵称 信息
    （快速回复）以聊天形式发送 /r 信息`,
  runByChat: true,
  dataRules: [
    {
      name: 'text',
      required: true,
      all: true,
    },
  ],
};
