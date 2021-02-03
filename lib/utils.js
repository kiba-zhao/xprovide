/**
 * @fileOverview 工具代码文件
 * @name utils.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const readPkg = require('read-pkg');
const { isArray, isString, isPlainObject, isFunction, isBoolean, defaults } = require('lodash');
const isClass = require('is-class');
const path = require('path');

const pkg = readPkg.sync({ cwd: path.resolve(__dirname, '..') });
exports.pkg = pkg;
exports.isPlainObject = isPlainObject;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.isString = isString;
exports.defaults = defaults;
exports.isClass = isClass;
