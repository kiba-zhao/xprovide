/**
 * @fileOverview xboot模块注入功能文件
 * @name inject.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { isFunction } = require('./utils');

/**
 * 模块
 * @typedef {Object} Module
 * @property {String} path 模块文件绝对路径
 * @property {any} content 模块内容
 * @property {String} cwd 执行目录
 */

/**
 * xboot模块注入功能函数
 * @param {Provider} provider
 * @param {Module} module
 */
function inject(provider, module) {
  const init = isFunction(module.content) ? module.content : undefined;
  if (init)
    init(provider);
}

module.exports = inject;
