/**
 * @fileOverview 提供器代码文件
 * @name provider.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { isFunction, isPlainObject, pkg, defaults, isBoolean } = require('./utils');

const PENDING_COUNT = Symbol('PENDING_COUNT');
const STORE = Symbol('STORE');
const PENDINGS = Symbol('PENDINGS');
const OPTS = Symbol('OPTS');

const DEFAULT_OPTS = { cache: true };
/**
 * 提供器
 * @class
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

  require(deps, complete, fatal) {
    const _deps = deps.map(parseDep);
    const requireds = checkPendings(this, _deps);
    if (requireds.length <= 0) {
      inject(this, { deps: _deps, complete, fatal });
      return;
    }

    const pendings = this[PENDINGS];
    const key = ++this[PENDING_COUNT];
    for (const id of requireds) {
      const _pendings = pendings[id] = pendings[id] || {};
      _pendings[key] = { id, deps: _deps, complete, fatal };
    }

  }

  define(id, deps, factory, opts = {}) {

    const _deps = deps.map(parseDep);

    const store = this[STORE];
    store[id] = defaults({ deps: _deps, factory }, opts, this[OPTS]);

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

    let ids = [id];
    const item = store[id];
    if (item) {
      cache[id] = true;
      if (item.model) { continue; }
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
      model = item.model || buildModel(provider, item.deps, item.factory);
      if (model !== item.model && item.cache) { item.model = model; }
    } else {
      assert(!required, `[${pkg.name}] Provider:dep ${id} is required`);
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
    if (isFunction(fatal)) { fatal(e); } else { throw e; }
  }

}
