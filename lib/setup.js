/**
 * @fileOverview xboot模块注入功能文件
 * @name setup.js
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
 * xboot模块安装功能函数
 * @param {xprovide:Provider} provider 提供器
 * @param {Module} module 安装模块
 */
function setup(provider, module) {
  const init = isFunction(module.content) ? module.content : undefined;
  if (init) { init(provider); }
}

module.exports = setup;
