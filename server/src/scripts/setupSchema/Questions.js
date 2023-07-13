/**
  * This object contains Prompt ( https://www.npmjs.com/package/prompt ) style
  * questions that the SetupWizard will require an answer to. Questions are asked
  * in the order they are specified here.
  *
  * The resulting config.json file will be used by the server, accessed by the
  * name specified. IE, a valid use is; config.adminName
  *
  */

const Questions = {
  properties: {
    tripSalt: {
      description: '盐值（留空则使用默认值）',
      type: 'string',
      hidden: true,
      replace: '*',
      before: (value) => {
        salt = value;
        return value;
      },
    },

    adminTrip: {
      type: 'string',
      hidden: true,
      replace: '*',
      description: '站长密码',
      message: '您必须输入一个密码',
      before: (value) => {
        const crypto = require('crypto');
        const sha = crypto.createHash('sha256');
        sha.update(value + salt);
        return sha.digest('base64').substr(0, 6);
      },
    },

    port: {
      type: 'integer',
      message: '端口必须是一个整数',
      description: '端口',
      default: '6060',
    },
  },
};

module.exports = Questions;
