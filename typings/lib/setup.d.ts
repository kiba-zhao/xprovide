export = setup;
/**
 * 模块
 * @typedef {Object} Module
 * @property {String} path 模块文件绝对路径
 * @property {any} content 模块内容
 * @property {String} cwd 执行目录
 */
/**
 * xboot模块安装功能函数
 * @param {xprovide:Provider} provider 提供器
 * @param {Module} module 安装模块
 */
declare function setup(provider: any, module: Module): void;
declare namespace setup {
    export { Module };
}
/**
 * 模块
 */
type Module = {
    /**
     * 模块文件绝对路径
     */
    path: string;
    /**
     * 模块内容
     */
    content: any;
    /**
     * 执行目录
     */
    cwd: string;
};
