/*
  Description: This module will be directly called by the server event handler
               when a socket connection is closed or lost.
*/

// module main
export async function run(core, server, socket, data) {
  if (data.cmdKey !== server.cmdKey) {
    // internal command attempt by client, increase rate limit chance and ignore
    return server.police.frisk(socket.address, 20);
  }

  // send leave notice to client peers
  if (socket.channel) {
    server.broadcast({
      cmd: 'onlineRemove',
      nick: socket.nick,
    }, { joined: true });
  }

  // commit close just in case
  socket.terminate();

  return true;
}

export const info = {
  name: 'disconnect',
  usage: '内部调用',
  description: '发送用户离开的通知',
  dataRules: [
    {
      name: 'cmdKey',
      required: true,
    }
  ]
};
