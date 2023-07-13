/*
  Description: Outputs more info than the legacy stats command
*/

// module support functions
const { stripIndents } = require('common-tags');

const formatTime = (time) => {
  let seconds = time[0] + time[1] / 1e9;

  let minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let hours = Math.floor(minutes / 60);
  minutes %= 60;

  const days = Math.floor(hours / 24);
  hours %= 24;

  return `${days.toFixed(0)}天 ${hours.toFixed(0)}小时 ${minutes.toFixed(0)}分钟 ${seconds.toFixed(0)}秒`;
};

// module main
export async function run(core, server, socket) {

  // dispatch info
  server.reply({
    cmd: 'info',
    text: stripIndents`# HackChat轻量版
### 服务器状态
当前连接数：${server.clients.size}
封禁IP数量：${(core.stats.get('users-banned') || 0)}
有效入站数据：${core.stats.get('incoming-data')} MB
有效出站数据：${core.stats.get('outgoing-data')} MB
稳定运行时长：${formatTime(process.hrtime(core.stats.get('start-time')))}
### 服务器统计
用户加入次数：${(core.stats.get('users-joined') || 0)}
信息发送次数：${(core.stats.get('messages-sent') || 0)}
踢出用户次数：${(core.stats.get('users-kicked') || 0)}
状态请求次数：${(core.stats.get('stats-requested') || 0)}`,
  }, socket);

  // stats are fun
  core.stats.increment('stats-requested');
}

export const info = {
  name: 'stats',
  description: '查看服务器状态',
  usage: `
    API: { cmd: 'morestats' }
    Text: /stats`,
  runByChat: true,
  dataRules: [],
};
