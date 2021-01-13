export = Provider;
/**
 * 提供器
 * @class
 */
declare class Provider {
    constructor(store: any, opts?: {
        cache: boolean;
    });
    require(deps: any, complete: any, fatal: any): void;
    define(id: any, deps: any, factory: any, opts?: {}): void;
    [STORE]: any;
    [OPTS]: {
        cache: boolean;
    };
    [PENDINGS]: {};
}
declare const STORE: unique symbol;
declare const OPTS: unique symbol;
declare const PENDINGS: unique symbol;