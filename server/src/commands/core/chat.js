/*
  Description: Rebroadcasts any `text` to all clients in a `channel`
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
export async function run(core, server, socket, data) {
  // check user input
  const text = parseText(data.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.replyWarn(`您聊天过于频繁，请稍后再试。\n按下向上按钮即可恢复刚刚没有发出去的信息。`, socket)
  }

  // build chat payload
  const payload = {
    cmd: 'chat',
    ...UAC.getUserDetails(socket),
    text,
  };

  if (UAC.isAdmin(socket.level)) {
    payload.admin = true;
  } else if (UAC.isModerator(socket.level)) {
    payload.mod = true;
  }

  if (socket.trip) {
    payload.trip = socket.trip;
  }

  // broadcast to channel peers
  server.broadcast(payload, { joined: true });

  // stats are fun
  core.stats.increment('messages-sent');

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.finalCmdCheck.bind(this), 254);
}

export function finalCmdCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (!payload.text.startsWith('/')) {
    return payload;
  }

  if (payload.text.startsWith('//')) {
    payload.text = payload.text.substr(1);
    return payload;
  }

  const cmd = payload.text.split(' ')[0].slice(1)
  const command = core.commands.get(cmd)

  if (!command) {
    core.commands.handleFail(server, socket, { cmd })
    return false
  }

  if (command.info.runByChat) {
    if (Array.isArray(command.info.dataRules)) {
      const data = core.commands.parseText(command.info.dataRules, payload.text)
      core.commands.handleCommand(server, socket, data)
      return false
    }
  }

  core.commands.handleFail(server, socket, { cmd })

  return false;
}

export const info = {
  name: 'chat',
  description: '向所有用户发送一条信息',
  usage: `
    API: { cmd: 'chat', text: '<text to send>' }`,
  dataRules: [
    {
      name: 'text',
      required: true,
      verify: text => !!parseText(text),
      errorMessage: '您想表达什么？',
    },
  ],
};
