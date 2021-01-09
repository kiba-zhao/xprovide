/**
 * @fileOverview 提供器代码文件
 * @name provider.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { isPlainObject, isBoolean, pkg, defaults } = require('./utils');

const STORE = Symbol('STORE');
const CACHE = Symbol('CACHE');
const PENDINGS = Symbol('PENDINGS');

const DEFAULT_OPTS = {
  store: {},
  cache: true
};
const DEFAULT_STORE_OPTS = {
  cache: true
};

/**
 * 提供器
 * @class 
 */
class Provider {
  constructor(opts = {}) {
    assert(isPlainObject(opts), `[${pkg.name}] Provider: wrong opts`);

    const _opts = defaults(opts, DEFAULT_OPTS);
    assert(isPlainObject(_opts.store), `[${pkg.name}] Provider: wrong opts.store`);
    assert(isBoolean(_opts.cache), `[${pkg.name}] Provider: wrong opts.cache`);

    this[STORE] = _opts.store;
    this[CACHE] = _opts.cache ? {} : null;
    this[PENDINGS] = {};
  }

  async require(...args) {
    const provider = this;
    return new Promise((resolve, reject) => {
      provider.inject(args, resolve, reject);
    });
  }

  inject(deps, complete, fatal) {
    const _deps = deps.map(parseDep);
    const requireds = checkPendings(this, _deps);
    if (requireds.length <= 0) {
      try {
        buildModel(this, _deps, complete);
      } catch (e) {
        if (fatal)
          fatal(e);
        else
          throw e;
      }
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
    store[id] = defaults({ deps: deps.map(parseDep), factory }, opts, DEFAULT_STORE_OPTS);

    const pendings = this[PENDINGS];
    const plist = pendings[id];
    if (!plist || plist.length <= 0)
      return;

    delete pendings[id];
    for (let pitem of plist) {
      const { deps, complete, fatal } = pitem;
      const requireds = checkPendings(this, deps);
      if (requireds.length > 0)
        continue;
      try {
        buildModel(this, deps, complete);
      } catch (e) {
        if (fatal)
          fatal(e);
        else
          throw e;
      }
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


function checkPendings(provider, deps) {

  const store = provider[STORE];
  const cache = provider[CACHE];
  const pendings = [];
  for (let dep of deps) {

    let { id, required } = dep;
    if (!required)
      continue;

    if (cache && cache[id])
      continue;

    let ids = [id];
    let item = store[id];
    if (item) {
      if (!item.deps || item.deps.length <= 0)
        continue;
      ids = checkPendings(provider, item.deps);
      if (ids.length <= 0)
        continue;
    }
    pendings.push(...ids);
  }

  return pendings;
}

function buildModel(provider, deps, action) {
  if (deps.length <= 0)
    return action();

  const cache = provider[CACHE];
  const store = provider[STORE];
  const args = [];
  for (let dep of deps) {

    const { id, required } = dep;
    if (item.cache && cache && cache[id]) {
      args.push(cache[id]);
      continue;
    }

    let model = undefined;
    const item = store[id];
    if (item) {
      model = buildModel(provider, item.deps, item.factory);
    } else {
      assert(!required, `dep ${id} is required`);
    }

    if (item.cache && cache)
      cache[id] = model;
    args.push(model);
  }

  return action(...args);
}
