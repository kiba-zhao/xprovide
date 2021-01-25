/**
 * @fileOverview xboot引导测试文件
 * @name xboot.test.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

describe('xboot', () => {

  const Provider = jest.fn();
  let xboot;

  beforeAll(() => {
    jest.doMock('../lib/provider', () => Provider, { virtual: true });
    xboot = require('@/xboot');
    jest.resetModules();
  });

  afterEach(() => {
    Provider.mockReset();
  });

  afterAll(() => {
    jest.dontMock('../lib/provider');
    xboot = undefined;
  });

  it('simple', () => {

    const context = Symbol('context');
    const boot = { createBootLoader: jest.fn(), setup: jest.fn() };
    const provider = { define: jest.fn() };
    Provider.mockImplementation(() => provider);

    const modules = [ Symbol('module1', 'module2', 'module3') ];
    boot.createBootLoader.mockReturnValueOnce(modules);
    xboot(boot, context);

    expect(Provider).toBeCalledTimes(1);
    expect(Provider).toBeCalledWith();
    expect(provider.define).toBeCalledTimes(1);
    expect(provider.define).toBeCalledWith('boot', { ...boot, context });
    expect(boot.createBootLoader).toBeCalledTimes(1);
    expect(boot.createBootLoader).toBeCalledWith('xprovide.js', context);
    expect(boot.setup).toBeCalledTimes(modules.length);
    for (let i = 0; i < modules.length - 1; i++) {
      expect(boot.setup.mock.calls[i]).toEqual([ modules[i], provider ]);
    }
  });

});
