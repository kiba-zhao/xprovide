/**
 * @fileOverview xboot入口文件
 * @name xboot.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { Provider } = require('./index.js');

/**
 * xboot入口函数
 * @exports xboot
 * @param {xboot} boot xboot包目录对象
 * @param {Object} context xboot引导上下文缓存
 */
module.exports = (boot, context) => {

  const provider = new Provider();
  provider.define('boot', [], { ...boot, context });

  const loader = boot.createBootLoader('xprovide.js', context);
  loader.forEach(_ => boot.setup(_, provider));

};
