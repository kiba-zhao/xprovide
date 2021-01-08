/**
 * @fileOverview 提供器代码文件
 * @name provider.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { isPlainObject, pkg } = require('./utils');

const STORE = Symbol('STORE');


/**
 * 提供器
 * @class 
 */
class Provider {
  constructor(store = {}) {
    assert(isPlainObject(store), `[${pkg.name}] Provider: wrong store`);
    this[STORE] = store;
  }

  async require(...args) {

  }

  define(id, deps, factory) {

  }
}
