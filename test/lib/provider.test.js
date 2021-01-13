/**
 * @fileOverview 提供器测试文件
 * @name provider.test.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const Provider = require('@/lib/provider');

describe('lib/provider', () => {

  it('simple success', (done) => {

    const provider = new Provider();
    const ids = ['model1', 'model2', 'model3'];
    const models = [];

    for (let id of ids) {
      const model = Symbol(id);
      models.push(model);
      provider.define(id, [], () => model);
    }

    provider.require(ids, (...args) => {
      expect(args).toEqual(models);
      done();
    });

  });

  it('simple success with require first', (done) => {

    const provider = new Provider();
    const ids = ['model1', 'model2', 'model3'];
    const models = [];

    provider.require(ids, (...args) => {
      expect(args).toEqual(models);
      done();
    });

    for (let id of ids) {
      const model = Symbol(id);
      models.push(model);
      provider.define(id, [], () => model);
    }

  });

  it('require with dep', (done) => {

    const provider = new Provider();
    const ids = ['model1', 'model2', 'model3'];
    const factories = [];
    const models = [];

    provider.require(ids.slice(0, 1), (m) => {

      expect(m).toEqual(models[0]);
      expect(factories[0]).toBeCalledTimes(1);
      expect(factories[0]).toBeCalledWith(...(models.slice(1)));
      expect(factories[1]).toBeCalledTimes(1);
      expect(factories[1]).toBeCalledWith(...(models.slice(2)));
      expect(factories[2]).toBeCalledTimes(1);
      expect(factories[2]).toBeCalledWith();

      done();
    });

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const model = Symbol(id);
      models.push(model);
      factories.push(jest.fn(() => model));
      provider.define(id, ids.slice(i + 1), factories[i]);
    }

  });

});

