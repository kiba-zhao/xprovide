export = Provider;
/**
 * 提供器
 * @class
 */
declare class Provider {
    constructor(store?: {}, opts?: {
        cache: boolean;
    });
    require(deps: any, complete: any, fatal: any): void;
    define(id: any, deps: any, factory: any, opts?: {}): void;
    [PENDING_COUNT]: number;
    [STORE]: {};
    [OPTS]: {
        cache: boolean;
    };
    [PENDINGS]: {};
}
declare const PENDING_COUNT: unique symbol;
declare const STORE: unique symbol;
declare const OPTS: unique symbol;
declare const PENDINGS: unique symbol;
