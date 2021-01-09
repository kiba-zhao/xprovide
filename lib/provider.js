/**
 * @fileOverview 提供器代码文件
 * @name provider.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { isFunction, isPlainObject, pkg, defaults, isBoolean } = require('./utils');

const STORE = Symbol('STORE');
const PENDINGS = Symbol('PENDINGS');
const OPTS = Symbol('OPTS');

const DEFAULT_OPTS = { cache: true };
/**
 * 提供器
 * @class 
 */
class Provider {
  constructor(store, opts = DEFAULT_OPTS) {

    assert(isPlainObject(store), `[${pkg.name}] Provider: wrong store`);
    assert(isPlainObject(opts), `[${pkg.name}] Provider: wrong opts`);
    assert(isBoolean(opts.cache), `[${pkg.name}] Provider: wrong opts.cache`);

    this[STORE] = store;
    this[OPTS] = opts;
    this[PENDINGS] = {};
  }

  require(deps, complete, fatal) {
    const _deps = deps.map(parseDep);
    const requireds = checkPendings(this, _deps);
    if (requireds.length <= 0) {
      inject(this, { deps: _deps, complete, fatal });
      return;
    }

    const pendings = this[PENDINGS];
    for (let id of requireds) {
      const plist = pendings[id] = pendings[id] || [];
      plist.push({ deps: _deps, complete, fatal });
    }

  }

  define(id, deps, factory, opts = {}) {

    const store = this[STORE];
    store[id] = defaults({ deps: deps.map(parseDep), factory }, opts, this[OPTS]);

    const pendings = this[PENDINGS];
    const plist = pendings[id];
    if (!plist || plist.length <= 0)
      return;

    delete pendings[id];
    for (let pitem of plist) {
      const requireds = checkPendings(this, pitem.deps);
      if (requireds.length > 0)
        continue;
      inject(this, pitem);
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
  for (let dep of deps) {

    let { id, required } = dep;
    assert(!parent[id], `Circular dependency ${id}`);

    if (!required)
      continue;

    if (cache.hasOwnProperty(id))
      continue;

    let ids = [id];
    let item = store[id];
    if (item) {
      cache[id] = true;
      if (item.model)
        continue;
      if (!item.deps || item.deps.length <= 0)
        continue;
      ids = checkPendings(provider, item.deps, cache, { ...parent, id });
      if (ids.length <= 0)
        continue;
    }
    cache[id] = false;
    pendings.push(...ids);
  }

  return pendings;
}

function buildModel(provider, deps, action) {
  if (deps.length <= 0)
    return action();

  const store = provider[STORE];
  const args = [];
  for (let dep of deps) {

    const { id, required } = dep;
    const item = store[id];

    let model = undefined;
    if (item) {
      model = item.model || buildModel(provider, item.deps, item.factory);
      if (model !== item.model && item.cache)
        item.model = model;
    } else {
      assert(!required, `dep ${id} is required`);
    }

    args.push(model);
  }

  return action(...args);
}

function inject(provider, opts) {

  const { deps, complete, fatal } = opts;

  try {
    buildModel(provider, deps, complete);
  } catch (e) {
    if (isFunction(fatal))
      fatal(e);
    else
      throw e;
  }

}

