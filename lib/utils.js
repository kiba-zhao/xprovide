/**
 * @fileOverview 工具代码文件
 * @name utils.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const readPkg = require('read-pkg');
const { isPlainObject, isFunction, isBoolean, defaults } = require('lodash');
const path = require('path');

const pkg = readPkg.sync({ cwd: path.resolve(__dirname, '..') });
exports.pkg = pkg;
exports.isPlainObject = isPlainObject;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.defaults = defaults;
