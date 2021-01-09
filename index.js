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
const setup = require('./lib/setup');

/** Provider. */
exports.Provider = Provider;

/** xboot setup. */
exports.setup = setup;
