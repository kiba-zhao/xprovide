/**
 * @fileOverview 安装模块测试文件
 * @name setup.test.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const setup = require('@/lib/setup');

describe('lib/setup', () => {

  const provider = Symbol('provider');

  it('success', () => {
    const init = jest.fn();
    setup(provider, { content: init });

    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toBeCalledWith(provider);
  });

  it('error', () => {
    const error = new Error('setup error');
    const init = jest.fn(() => { throw error; });

    expect(() => {
      setup(provider, { content: init });
    }).toThrow(error);

    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toBeCalledWith(provider);

  });

  it('module.content not function', () => {

    expect(() => {
      setup(provider, {});
    }).not.toThrow();

  });
});
