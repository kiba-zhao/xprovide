/**
 * @fileOverview 目录文件
 * @name index.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

/**
 * @module xprovide
 */

const Provider = require('./lib/provider');
const inject = require('./lib/inject');

/** Provider. */
exports.Provider = Provider;

/** injectn. */
exports.inject = inject;
