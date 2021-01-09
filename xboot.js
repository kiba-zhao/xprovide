/**
 * @fileOverview xboot入口文件
 * @name xboot.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { Provider, setup } = require('./index.js');
const { BootLoader } = require('xboot');

const loader = new BootLoader('xprovide.js');
const provider = new Provider();

loader.forEach(_ => setup(provider, _));
