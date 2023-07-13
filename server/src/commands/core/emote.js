/*
  Description: Broadcasts an emote to the current channel
*/

import * as UAC from '../utility/UAC/_info'

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
  let text = parseText(payload.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.replyWarn(`您聊天过于频繁，请稍后再试。\n按下向上按钮即可恢复刚刚没有发出去的信息。`, socket)
  }

  if (!text.startsWith("'")) {
    text = ` ${text}`;
  }

  const newPayload = {
    cmd: 'info',
    type: 'emote',
    ...UAC.getUserDetails(socket),
    text: `@${socket.nick}${text}`,
  };

  if (socket.trip) {
    newPayload.trip = socket.trip;
  }

  // broadcast to channel peers
  server.broadcast(newPayload, { joined: true });

  core.stats.increment('messages-sent');
  
  return true;
}

export const info = {
  name: 'emote',
  description: '以第三方身份发送自己的状态',
  aliases: ['me'],
  usage: `
    API: { cmd: 'emote', text: '<emote/action text>' }
    以聊天形式发送 /me 信息`,
  runByChat: true,
  dataRules: [
    {
      name: 'text',
      required: true,
      verify: text => !!parseText(text),
      errorMessage: '您想表达什么？',
      all: true,
    },
  ],
};
