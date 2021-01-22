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

      const success = jest.fn();
      provider.require(ids, success);
      const success_next = jest.fn();
      provider.require(ids, success_next);

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(...models);
      expect(success_next).toBeCalledTimes(1);
      expect(success_next).toBeCalledWith(...models);
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

      const success = jest.fn();
      provider.require(ids, success);

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, [], factories[factories.length - 1]);
      }

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(...models);
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

      const success = jest.fn();
      provider.require(ids.slice(0, 1), success);

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const model = Symbol(id);
        models.push(model);
        factories.push(jest.fn(() => model));
        provider.define(id, ids.slice(i + 1, i + 2), factories[i]);
      }

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(models[0]);
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

      const success = jest.fn();
      provider.require([ `${ids[0]}?`, 'opt1?' ], success);

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(models[0], undefined);
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


  describe('provide with not function', () => {

    it('success', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const models = [];

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        provider.define(id, [], model);
      }

      const success = jest.fn();
      provider.require(ids, success);

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(...models);

    });

    it('success with require first', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const models = [];

      const success = jest.fn();
      provider.require(ids, success);

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        provider.define(id, [], model);
      }

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(...models);

    });

    it('success undefined', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const models = [];

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        provider.define(id, [], model);
      }

      let success = jest.fn();
      provider.require(ids, success);

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(...models);

      const undefined_id = 'undefined';
      provider.define(undefined_id, []);

      success = jest.fn();
      provider.require([ undefined_id ], success);

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(undefined);

    });

    it('success undefined with require first', () => {

      const provider = new Provider();
      const ids = [ 'model1', 'model2', 'model3' ];
      const models = [];

      let success = jest.fn();
      provider.require(ids, success);

      for (const id of ids) {
        const model = Symbol(id);
        models.push(model);
        provider.define(id, [], model);
      }

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(...models);

      const undefined_id = 'undefined';
      success = jest.fn();
      provider.require([ undefined_id ], success);
      provider.define(undefined_id, []);

      expect(success).toBeCalledTimes(1);
      expect(success).toBeCalledWith(undefined);

    });

  });

});

