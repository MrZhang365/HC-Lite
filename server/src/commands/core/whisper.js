/*
  Description: Display text on targets screen that only they can see
*/

import * as UAC from '../utility/UAC/_info';

// module support functions

const parseText = (text) => {
  // verifies user input is text
  if (typeof text !== 'string') {
    return false;
  }

  let sanitizedText = text;

  // strip newlines from beginning and end
  sanitizedText = sanitizedText.replace(/^\s*\n|^\s+$|\n\s*$/g, '');
  // replace 3+ newlines with just 2 newlines
  sanitizedText = sanitizedText.replace(/\n{3,}/g, '\n\n');

  return sanitizedText;
};

// module main
export async function run(core, server, socket, payload) {
  // check user input
  const text = parseText(payload.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.replyWarn(`您发送私信的速度太快了，请稍后再试`, socket)
  }

  const targetNick = payload.nick;

  // find target user
  let targetClient = server.findSockets({ channel: socket.channel, nick: targetNick });

  if (targetClient.length === 0) {
    return server.replyWarn(`找不到目标用户`, socket)
  }

  [targetClient] = targetClient;

  server.reply({
    cmd: 'info',
    type: 'whisper',
    from: socket.nick,
    trip: socket.trip || 'null',
    text: `${socket.nick} 向您发送私信: ${text}`,
    message: text,
  }, targetClient);

  targetClient.whisperReply = socket.nick;

  server.reply({
    cmd: 'info',
    type: 'whisper',
    text: `您向 ${targetNick} 发送私信: ${text}`,
    message: text,
  }, socket);

  core.stats.increment('messages-sent');

  return true;
}

export const info = {
  name: 'whisper',
  aliases: ['w'],
  description: '向某人发送私信',
  usage: `
    API: { cmd: 'whisper', nick: '<target name>', text: '<text to whisper>' }
    以聊天形式发送 /whisper 目标昵称 信息
    以聊天形式发送 /w 目标昵称 信息
    （快速回复）以聊天形式发送 /reply 信息
    （快速回复）以聊天形式发送 /r 信息`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick,
      required: true,
    },
    {
      name: 'text',
      verify: text => !!parseText(text),
      errorMessage: '您想表达什么？',
      required: true,
      all: true,
    },
  ],
};
