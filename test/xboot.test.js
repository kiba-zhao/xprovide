/**
 * @fileOverview xboot引导测试文件
 * @name xboot.test.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

describe('xboot', () => {

  const Provider = jest.fn();
  const Loader = jest.fn();

  beforeAll(() => {
    jest.doMock('../lib/provider', () => Provider, { virtual: true });
    jest.doMock('xboot', () => ({ BootLoader: Loader }), { virtual: true });
  });

  afterEach(() => {
    Provider.mockReset();
    Loader.mockReset();

    jest.resetModules();
  });

  afterAll(() => {
    jest.dontMock('../lib/provider');
    jest.dontMock('xboot');
  });

  it('simple', () => {
    const provider = { test: 123 };
    const modules = [ jest.fn(), jest.fn() ];
    Provider.mockImplementation(() => provider);
    Loader.mockImplementation(() => modules.map(_ => ({ content: _ })));

    require('@/xboot');

    expect(Loader).toBeCalledTimes(1);
    expect(Loader).toBeCalledWith('xprovide.js');
    expect(Provider).toBeCalledTimes(1);
    expect(Provider).toBeCalledWith();
    for (const fn of modules) {
      expect(fn).toBeCalledTimes(1);
      expect(fn).toBeCalledWith(provider);
    }
  });

});
