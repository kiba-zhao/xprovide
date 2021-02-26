export = Provider;
/**
 * 提供器可选项
 * @typedef {Object} Opts
 * @property {boolean} cache 是否缓存创建结果
 */
/**
 * 提供器
 * @class
 * @param {Object} store 存储对象
 * @param {Opts} opts 可选项
 */
declare class Provider {
    constructor(store?: {}, opts?: {
        cache: boolean;
    });
    /**
     * 请求依赖模型
     * @param {Array<String> | Array<Symbol> | Array<DepRefer>} deps 模型依赖
     * @param {Function} success 成功回调
     * @param {Function} fatal 失败回调(可选)
     */
    require(deps: Array<string> | Array<Symbol> | Array<DepRefer>, success: Function, fatal: Function): void;
    /**
     * 定义模型
     * @param {String | Symbol} id 模型Id
     * @param {Array<String> | Array<Symbol> | Array<DepRefer>} deps 模型依赖
     * @param {any} factory 模型构建函数或模型本身
     * @param {Opts} opts 可选项
     */
    define(id: string | Symbol, deps: Array<string> | Array<Symbol> | Array<DepRefer>, factory: any, opts?: Opts): void;
}
declare namespace Provider {
    export { DepRefer, InjectOpts, Opts };
}
/**
 * 依赖对象描述
 */
type DepRefer = {
    /**
     * 是否必要
     */
    required: boolean;
    /**
     * 唯一标识
     */
    id: string;
};
/**
 * 提供器可选项
 */
type Opts = {
    /**
     * 是否缓存创建结果
     */
    cache: boolean;
};
/**
 * 注入可选项
 */
type InjectOpts = {
    /**
     * 依赖描述对象
     */
    deps: Array<DepRefer>;
    /**
     * 构建依赖模块成功后执行函数
     */
    success: Function;
    /**
     * 构建依赖模块失败执行函数
     */
    fatal: Function;
};
