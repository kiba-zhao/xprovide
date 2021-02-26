/**
 * @fileOverview 提供器代码文件
 * @name provider.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { isArray, isSymbol, isString, isPlainObject, isFunction, isBoolean, defaults } = require('lodash');
const isClass = require('is-class');

const PENDING_COUNT = Symbol('PENDING_COUNT');
const STORE = Symbol('STORE');
const PENDINGS = Symbol('PENDINGS');
const OPTS = Symbol('OPTS');

const DEFAULT_OPTS = { cache: true };

/**
 * 提供器可选项
 * @typedef {Object} Opts
 * @property {boolean} cache 是否缓存创建结果
 */

/**
 * 提供器
 * @class
 * @param {Object} store 存储对象
 * @param {Opts} opts 可选项
 */
class Provider {
  constructor(store = {}, opts = DEFAULT_OPTS) {

    assert(isPlainObject(store), '[xprovide] Provider Error: wrong store');
    assert(isPlainObject(opts), '[xprovide] Provider Error: wrong opts');
    assert(isBoolean(opts.cache), '[xprovide] Provider Error: wrong opts.cache');

    this[PENDING_COUNT] = 0;
    this[STORE] = store;
    this[OPTS] = opts;
    this[PENDINGS] = {};
  }

  /**
   * 请求依赖模型
   * @param {Array<String> | Array<Symbol> | Array<DepRefer>} deps 模型依赖
   * @param {Function} success 成功回调
   * @param {Function} fatal 失败回调(可选)
   */
  require(deps, success, fatal) {
    assert(isArray(deps) && deps.every(isDep), '[xprovide] Provider Error:require: wrong deps argument');
    assert(isFunction(success), '[xprovide] Provider Error:require: wrong success argument');
    assert(fatal === undefined || isFunction(fatal), '[xprovide] Provider Error:require: wrong fatal argument');

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
   * @param {String | Symbol} id 模型Id
   * @param {Array<String> | Array<Symbol> | Array<DepRefer>} deps 模型依赖
   * @param {any} factory 模型构建函数或模型本身
   * @param {Opts} opts 可选项
   */
  define(id, deps, factory, opts = {}) {

    assert(isString(id) || isSymbol(id), '[xprovide] Provider Error:define: wrong id argument');
    assert(isArray(deps) && deps.every(isDep), '[xprovide] Provider Error:define: wrong deps argument');
    assert(isPlainObject(opts), '[xprovide] Provider Error:define: wrong opts argument');
    assert((opts.cache === undefined || isBoolean(opts.cache)), '[xprovide] Provider Error:define: wrong opts.cache argument');

    const store = this[STORE];

    assert(store[id] === undefined, '[xprovide] Provider Error:define: store.${id} exists');

    const _deps = deps.map(parseDep);
    let _factory,
      _model;
    if (isFunction(factory) || isClass(factory)) {
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

/**
 * 依赖对象描述
 * @typedef {Object} DepRefer
 * @property {boolean} required 是否必要
 * @property {string} id 唯一标识
 */

/**
 * 解析依赖函数
 * @param {String | Symbol | DepRefer} dep 依赖描述字符串
 * @return {DepRefer} 解析后的依赖对象描述
 */
function parseDep(dep) {

  if (!isString(dep) && !isSymbol(dep)) { return dep; }

  let id = dep;
  let required = true;
  if (isString(dep) && dep.substr(-1, 1) === OPTIONAL_KEY) {
    id = dep.substr(0, dep.length - 1);
    required = false;
  }
  return { id, required };
}

/**
 * 判断是否为为依赖信息函数
 * @param {String | Symbol | DepRefer} dep 依赖信息
 * @return {Boolean} true:是/false:否
 */
function isDep(dep) {
  if (isString(dep) || isSymbol(dep)) {
    return true;
  } else if (dep === null || dep === undefined) {
    return false;
  }
  return (isString(dep.id) || isSymbol(dep.id)) && (isBoolean(dep.required) || dep.required === undefined);
}


/**
 * 检查不可用依赖项
 * @param {Provider} provider 提供器对象实例
 * @param {Array<DepRefer>} deps 依赖描述字符串
 * @param {Object} cache 检查缓存字典(对于多个依赖于同一个依赖项，缓存该依赖项检查结果)
 * @param {Object} parent 父级依赖项字典(用于检查是否存在循环依赖)
 * @return {Array<DepRefer>} 不可用依赖项描述
 */
function checkPendings(provider, deps, cache = {}, parent = {}) {

  const store = provider[STORE];
  const pendings = [];
  for (const dep of deps) {

    const { id, required } = dep;
    assert(!parent[id], `[xprovide] Provider Error:Circular dependency ${id.toString()}`);

    if (required === false) { continue; }

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

/**
 * 构建依赖模块
 * @param {Provider} provider 提供器对象实例
 * @param {Array<DepRefer>} deps 依赖描述对象数组
 * @param {Function} action 执行函数
 * @return {any} 执行函数的执行结果
 */
function buildModel(provider, deps, action) {
  if (deps.length <= 0) { return isClass(action) ? new action() : action(); }

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
      assert(required === false, `[xprovide] Provider Error:dep ${id.toString()} is required`);
    }

    args.push(model);
  }

  return isClass(action) ? new action(...args) : action(...args);
}

/**
 * 注入可选项
 * @typedef {Object} InjectOpts
 * @property {Array<DepRefer>} deps 依赖描述对象
 * @property {Function} success 构建依赖模块成功后执行函数
 * @property {Function} fatal 构建依赖模块失败执行函数
 */

/**
 * 提供器注入函数
 * @param {Provider} provider 提供器对象实例
 * @param {InjectOpts} opts 注入可选项
 * @throws {Error} 抛出构建依赖模块异常
 */
function inject(provider, opts) {

  const { deps, success, fatal } = opts;

  try {
    buildModel(provider, deps, success);
  } catch (e) {
    if (isFunction(fatal)) { fatal(e); } else { throw e; }
  }

}

/**
 * undefined工厂函数
 * @return {undefined} undefined值
 */
function undefinedFactory() {
  return undefined;
}
