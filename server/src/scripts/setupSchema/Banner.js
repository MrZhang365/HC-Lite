/**
  * This script will be run before the package starts asking for the config data,
  * used to output a simple guide for the coming questions, or to spam some sexy
  * ascii art at the user.
  *
  */

import { stripIndents } from 'common-tags';
import chalk from 'chalk';

// gotta have that sexy console
console.log(stripIndents`
  ${chalk.magenta('°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø')}
  ${chalk.gray('--------------(') + chalk.white(' HackChat轻量版配置生成向导 ') + chalk.gray(')--------------')}
  ${chalk.magenta('°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø')}

  ${chalk.white('注意：')}执行 ${chalk.green('npm/yarn run config')} 将会重新运行本向导

  您即将配置以下项目
  -  ${chalk.magenta('      盐值')}, 用于生成识别码的盐值
  -  ${chalk.magenta('  站长密码')}, 站长的密码
  -  ${chalk.magenta('      端口')}, 服务器端口
  \u200b
`);
