/*
  Description: Initial entry point, applies `channel` and `nick` to the calling socket
*/

import * as UAC from '../utility/UAC/_info';

// module support functions
const crypto = require('crypto');

const hash = (password) => {
  const sha = crypto.createHash('sha256');
  sha.update(password);
  return sha.digest('base64').substr(0, 6);
};

// exposed "login" function to allow hooks to verify user join events
// returns object containing user info or string if error
export function parseNickname(core, data) {
  const userInfo = {
    nick: '',
    uType: 'user', /* @legacy */
    trip: null,
    level: UAC.levels.default,
  };

  // seperate nick from password
  const nickArray = data.nick.split('#', 2);
  userInfo.nick = nickArray[0].trim();

  let password = undefined;
  // prioritize hash in nick for password over password field
  if (typeof nickArray[1] === 'string') {
    password = nickArray[1];
  } else if (typeof data.password === 'string') {
    password = data.password;
  }

  if (password) {
    userInfo.trip = hash(password + core.config.tripSalt)
  }

  if (core.config.mods.includes(userInfo.trip)) {
    userInfo.uType = 'mod'
    userInfo.level = UAC.levels.moderator
  }

  if (userInfo.trip === core.config.adminTrip) {
    userInfo.uType = 'admin'
    userInfo.level = UAC.levels.admin
  }

  return userInfo;
}

// module main
export async function run(core, server, socket, data) {
  // check for spam
  if (server.police.frisk(socket.address, 3)) {
    server.replyWarn(`您加入频道的速度太快了，请稍后再试`)
    return socket.terminate()
  }

  // calling socket already in a channel
  if (socket.joined) return server.replyWarn(`您已经加入频道了`, socket)

  const userInfo = this.parseNickname(core, data);
  if (typeof userInfo === 'string') {
    server.replyWarn(userInfo, socket)
    return socket.terminate()
  }

  // check if the nickname already exists in the channel
  const userExists = server.findSockets({
    joined: true,
    nick: (targetNick) => targetNick.toLowerCase() === userInfo.nick.toLowerCase(),
  });

  if (userExists.length > 0) {
    // that nickname is already in that channel
    return server.replyWarn(`已经有人使用了此昵称`, socket)
  }

  userInfo.hash = server.getSocketHash(socket);

  // assign "unique" socket ID
  if (typeof socket.userid === 'undefined') {
    userInfo.userid = Math.floor(Math.random() * 9999999999999);
  }

  // TODO: place this within it's own function allowing import
  // prepare to notify channel peers
  const newPeerList = server.findSockets({ joined: true });
  const nicks = []; /* @legacy */
  const users = [];

  const joinAnnouncement = {
    cmd: 'onlineAdd',
    nick: userInfo.nick,
    trip: userInfo.trip || 'null',
    utype: userInfo.uType, /* @legacy */
    hash: userInfo.hash,
    level: userInfo.level,
    userid: userInfo.userid,
  };

  // send join announcement and prep online set
  for (let i = 0, l = newPeerList.length; i < l; i += 1) {
    server.reply(joinAnnouncement, newPeerList[i]);
    nicks.push(newPeerList[i].nick); /* @legacy */

    users.push({
      ...UAC.getUserDetails(newPeerList[i]),
      isme: false,
    });
  }

  // store user info
  socket.uType = userInfo.uType; /* @legacy */
  socket.nick = userInfo.nick;
  socket.trip = userInfo.trip;
  socket.hash = userInfo.hash;
  socket.level = userInfo.level;
  socket.userid = userInfo.userid;

  nicks.push(socket.nick); /* @legacy */
  users.push({
    nick: socket.nick,
    trip: socket.trip,
    utype: socket.uType,
    hash: socket.hash,
    level: socket.level,
    userid: socket.userid,
    isme: true,
  });

  // reply with channel peer list
  server.reply({
    cmd: 'onlineSet',
    nicks, /* @legacy */
    users,
  }, socket);

  socket.joined = true

  // stats are fun
  core.stats.increment('users-joined');

  return true;
}

export const info = {
  name: 'join',
  description: '加入频道',
  usage: `
    API: { cmd: 'join', nick: '<your nickname>', password: '<optional password>' }`,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: nick => UAC.verifyNickname(nick.split('#')[0]),
      errorMessage: UAC.nameLimit.nick,
    },
    {
      name: 'password'
    },
  ],
};
