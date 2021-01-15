/**
 * @fileOverview 提供器代码文件
 * @name provider.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { isArray, isString, isFunction, isPlainObject, pkg, defaults, isBoolean } = require('./utils');

const PENDING_COUNT = Symbol('PENDING_COUNT');
const STORE = Symbol('STORE');
const PENDINGS = Symbol('PENDINGS');
const OPTS = Symbol('OPTS');

const DEFAULT_OPTS = { cache: true };

/**
 * 模块
 * @typedef {Opts} 提供器可选项
 * @property {boolean} cache 是否缓存创建结果
 */

/**
 * 提供器
 * @class
 * @alias xprovide:Provider 提供器类
 * @param {Object} store 存储对象
 * @param {Opts} opts 可选项
 */
class Provider {
  constructor(store = {}, opts = DEFAULT_OPTS) {

    assert(isPlainObject(store), `[${pkg.name}] Provider: wrong store`);
    assert(isPlainObject(opts), `[${pkg.name}] Provider: wrong opts`);
    assert(isBoolean(opts.cache), `[${pkg.name}] Provider: wrong opts.cache`);

    this[PENDING_COUNT] = 0;
    this[STORE] = store;
    this[OPTS] = opts;
    this[PENDINGS] = {};
  }

  /**
   * 请求依赖模型
   * @param {Array<String>} deps 依赖模型Id
   * @param {Function} success 成功回调
   * @param {Function} fatal 失败回调(可选)
   */
  require(deps, success, fatal) {
    assert(isArray(deps) && deps.every(isString), `[${pkg.name}] Provider:require: wrong deps argument`);
    assert(isFunction(success), `[${pkg.name}] Provider:require: wrong success argument`);
    assert(fatal === undefined || isFunction(fatal), `[${pkg.name}] Provider:require: wrong fatal argument`);

    const _deps = deps.map(parseDep);
    const requireds = checkPendings(this, _deps);
    if (requireds.length <= 0) {
      inject(this, { deps: _deps, success, fatal });
      return;
    }

    const pendings = this[PENDINGS];
    const key = ++this[PENDING_COUNT];
    const value = { deps: _deps, success, fatal };
    for (const id of requireds) {
      const _pendings = pendings[id] = pendings[id] || {};
      _pendings[key] = value;
    }

  }

  /**
   * 定义模型
   * @param {String} id 模型Id
   * @param {Array<String>} deps 模型依赖
   * @param {any} factory 模型构建函数或模型本身
   * @param {Opts} opts 可选项
   */
  define(id, deps, factory, opts = {}) {

    assert(isString(id), `[${pkg.name}] Provider:define: wrong id argument`);
    assert(isArray(deps) && deps.every(isString), `[${pkg.name}] Provider:define: wrong deps argument`);
    assert(isPlainObject(opts), `[${pkg.name}] Provider:define: wrong opts argument`);
    assert((opts.cache === undefined || isBoolean(opts.cache)), `[${pkg.name}] Provider:define: wrong opts.cache argument`);

    const store = this[STORE];

    assert(isString(id), `[${pkg.name}] Provider:define: store.${id} exists`);

    const _deps = deps.map(parseDep);
    let _factory,
      _model;
    if (isFunction(factory)) {
      _factory = factory;
    } else if (factory === undefined) {
      _factory = undefinedFactory;
    } else {
      _model = factory;
    }
    store[id] = defaults({ deps: _deps, factory: _factory, model: _model }, opts, this[OPTS]);

    const pendings = this[PENDINGS];
    const _pendings = pendings[id];
    if (!_pendings) { return; }

    delete pendings[id];
    const requireds = checkPendings(this, _deps);
    if (requireds.length > 0) {
      for (const id of requireds) {
        const pds = pendings[id] = pendings[id] || {};
        Object.assign(pds, _pendings);
      }
      return;
    }

    for (const key in _pendings) {
      const pending = _pendings[key];
      const requireds = checkPendings(this, pending.deps);
      if (requireds.length > 0) { continue; }
      inject(this, pending);
    }
  }
}

module.exports = Provider;

const OPTIONAL_KEY = '?';
function parseDep(dep) {
  let id = dep;
  let required = true;
  if (dep.substr(-1, 1) === OPTIONAL_KEY) {
    id = dep.substr(0, dep.length - 1);
    required = false;
  }
  return { id, required };
}


function checkPendings(provider, deps, cache = {}, parent = {}) {

  const store = provider[STORE];
  const pendings = [];
  for (const dep of deps) {

    const { id, required } = dep;
    assert(!parent[id], `[${pkg.name}] Provider:Circular dependency ${id}`);

    if (!required) { continue; }

    if (cache.hasOwnProperty(id)) { continue; }

    let ids = [ id ];
    const item = store[id];
    if (item) {
      cache[id] = true;
      if (item.model !== undefined) { continue; }
      if (!item.deps || item.deps.length <= 0) { continue; }
      ids = checkPendings(provider, item.deps, cache, { ...parent, id });
      if (ids.length <= 0) { continue; }
    }
    cache[id] = false;
    pendings.push(...ids);
  }

  return pendings;
}

function buildModel(provider, deps, action) {
  if (deps.length <= 0) { return action(); }

  const store = provider[STORE];
  const args = [];
  for (const dep of deps) {

    const { id, required } = dep;
    const item = store[id];

    let model;
    if (item) {
      model = item.model !== undefined ? item.model : buildModel(provider, item.deps, item.factory);
      if (model !== item.model && item.cache) { item.model = model; }
    } else {
      assert(!required, `[${pkg.name}] Provider:dep ${id} is required`);
    }

    args.push(model);
  }

  return action(...args);
}

function inject(provider, opts) {

  const { deps, success, fatal } = opts;

  try {
    buildModel(provider, deps, success);
  } catch (e) {
    if (isFunction(fatal)) { fatal(e); } else { throw e; }
  }

}

function undefinedFactory() {
  return undefined;
}
