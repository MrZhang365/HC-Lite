/*
  Description: Used to relay warnings to clients internally
*/

// module main
export async function run(core, server, socket, data) {
  if (data.cmdKey !== server.cmdKey) {
    // internal command attempt by client, increase rate limit chance and ignore
    return server.police.frisk(socket.address, 20);
  }

  // send warning to target socket
  server.reply({ cmd: 'warn', text: data.text }, socket);

  return true;
}

export const info = {
  name: 'socketreply',
  usage: '内部调用',
  description: '发送warn',
  dataRules: [
    {
      name: 'cmdKey',
      required: true
    },
    {
      name: 'text',
      required: true,
    }
  ],
};
