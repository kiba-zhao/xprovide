export = Provider;
/**
 * 模块
 * @typedef {Opts} 提供器可选项
 * @property {boolean} cache 是否缓存创建结果
 */
/**
 * 提供器
 * @class
 * @alias xprovide:Provider 提供器类
 * @param {Object} store 存储对象
 * @param {Opts} opts 可选项
 */
declare class Provider {
    constructor(store?: {}, opts?: {
        cache: boolean;
    });
    /**
     * 请求依赖模型
     * @param {Array<String>} deps 依赖模型Id
     * @param {Function} success 成功回调
     * @param {Function} fatal 失败回调(可选)
     */
    require(deps: Array<string>, success: Function, fatal: Function): void;
    /**
     * 定义模型
     * @param {String} id 模型Id
     * @param {Array<String>} deps 模型依赖
     * @param {any} factory 模型构建函数或模型本身
     * @param {Opts} opts 可选项
     */
    define(id: string, deps: Array<string>, factory: any, opts?: any): void;
}
declare namespace Provider {
    export { 提供器可选项 };
}
/**
 * 模块
 */
type 提供器可选项 = any;
