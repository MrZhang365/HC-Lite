/*
  Description: Allows calling client to change their current nickname
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 6)) {
    return server.replyWarn('您修改昵称的速度太快了，请稍后再试', socket)
  }

  const previousNick = socket.nick;

  // make sure requested nickname meets standards
  const newNick = data.nick.trim();

  if (newNick == previousNick) {
    return server.replyWarn(`您提供的新昵称和您当前的昵称相同`, socket)
  }

  // find any sockets that have the same nickname
  const userExists = server.findSockets({
    channel: socket.channel,
    nick: (targetNick) => targetNick.toLowerCase() === newNick.toLowerCase() &&
      // Allow them to rename themselves to a different case
      targetNick != previousNick,
  });

  // return error if found
  if (userExists.length > 0) {
    // That nickname is already in that channel
    return server.replyWarn(`已经有人使用了此昵称`, socket)
  }

  socket.nick = newNick;

  // build join and leave notices
  // TODO: this is a legacy client holdover, name changes in the future will
  //       have thieir own event
  const leaveNotice = {
    cmd: 'onlineRemove',
    nick: previousNick,
  };

  const joinNotice = {
    cmd: 'onlineAdd',
    ...UAC.getUserDetails(socket),
    nick: newNick,
  };

  // broadcast remove event and join event with new name, this is to support legacy clients and bots
  server.broadcast(leaveNotice, { joined: true });
  server.broadcast(joinNotice, { joined: true });

  // notify channel that the user has changed their name
  server.broadcastInfo(`${previousNick} 修改昵称为 ${newNick}`, { joined: true })

  return true;
}

export const info = {
  name: 'changenick',
  aliases: ['nick'],
  description: '修改你的昵称',
  usage: `
    API: { cmd: 'changenick', nick: '<new nickname>' }
    以聊天形式发送 /nick 新昵称`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick
    },
  ],
};
