/**
 * @fileOverview 提供器测试文件
 * @name provider.test.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const Provider = require('@/lib/provider');

describe('lib/provider', () => {

  describe('simple', () => {

    it('success', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, [], factories[factories.length - 1]);
      }

      provider.require(ids, (...args) => {
        expect(args).toEqual(models);
      });
      provider.require(ids, (...args) => {
        expect(args).toEqual(models);
      });
      expect(factories[0]).toBeCalledTimes(1);
      expect(factories[0]).toBeCalledWith();
      expect(factories[1]).toBeCalledTimes(1);
      expect(factories[1]).toBeCalledWith();
      expect(factories[2]).toBeCalledTimes(1);
      expect(factories[2]).toBeCalledWith();
    });

    it('success with require first', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];

      provider.require(ids, (...args) => {
        expect(args).toEqual(models);
      });

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, [], factories[factories.length - 1]);
      }
      expect(factories[0]).toBeCalledTimes(1);
      expect(factories[0]).toBeCalledWith();
      expect(factories[1]).toBeCalledTimes(1);
      expect(factories[1]).toBeCalledWith();
      expect(factories[2]).toBeCalledTimes(1);
      expect(factories[2]).toBeCalledWith();
    });

    it('require with dep', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];

      provider.require(ids.slice(0, 1), m => {
        expect(m).toEqual(models[0]);
      });

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, ids.slice(i + 1), factories[i]);
      }

      expect(factories[0]).toBeCalledTimes(1);
      expect(factories[0]).toBeCalledWith(...(models.slice(1)));
      expect(factories[1]).toBeCalledTimes(1);
      expect(factories[1]).toBeCalledWith(...(models.slice(2)));
      expect(factories[2]).toBeCalledTimes(1);
      expect(factories[2]).toBeCalledWith();

    });

    it('require with single dep', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];

      provider.require(ids.slice(0, 1), m => {
        expect(m).toEqual(models[0]);
      });

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, ids.slice(i + 1, i + 2), factories[i]);
      }

      expect(factories[0]).toBeCalledTimes(1);
      expect(factories[0]).toBeCalledWith(models[1]);
      expect(factories[1]).toBeCalledTimes(1);
      expect(factories[1]).toBeCalledWith(models[2]);
      expect(factories[2]).toBeCalledTimes(1);
      expect(factories[2]).toBeCalledWith();
    });

    it('require with optional dep', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, ids.slice(i + 1, i + 2), factories[i]);
      }

      provider.require([ `${ids[0]}?`, 'opt1?' ], m => {
        expect(m).toEqual(models[0]);
      });
      expect(factories[0]).toBeCalledTimes(1);
      expect(factories[0]).toBeCalledWith(models[1]);
      expect(factories[1]).toBeCalledTimes(1);
      expect(factories[1]).toBeCalledWith(models[2]);
      expect(factories[2]).toBeCalledTimes(1);
      expect(factories[2]).toBeCalledWith();

    });

    it('require fatal', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];
      const success = jest.fn();
      const fatal = jest.fn();
      const error = new Error();

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, ids.slice(i + 1, i + 2), factories[i]);
      }

      const errorFn = jest.fn(() => { throw error; });
      provider.define('errorFn', [], errorFn);
      provider.require([ 'errorFn', ...ids ], success, fatal);

      expect(success).not.toHaveBeenCalled();
      expect(fatal).toHaveBeenCalledTimes(1);
      expect(fatal).toHaveBeenCalledWith(error);
      expect(errorFn).toBeCalledTimes(1);
      expect(errorFn).toBeCalledWith();
      expect(factories[0]).not.toHaveBeenCalled();
      expect(factories[1]).not.toHaveBeenCalled();
      expect(factories[2]).not.toHaveBeenCalled();

    });

    it('require error', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const factories = [];
      const models = [];
      const success = jest.fn();
      const error = new Error();

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, ids.slice(i + 1, i + 2), factories[i]);
      }

      const errorFn = jest.fn(() => { throw error; });
      provider.define('errorFn', [], errorFn);

      expect(() => {
        provider.require([ 'errorFn', ...ids ], success);
      }).toThrow(error);
      expect(success).not.toHaveBeenCalled();
      expect(errorFn).toBeCalledTimes(1);
      expect(errorFn).toBeCalledWith();
      expect(factories[0]).not.toHaveBeenCalled();
      expect(factories[1]).not.toHaveBeenCalled();
      expect(factories[2]).not.toHaveBeenCalled();

    });

  });


});

