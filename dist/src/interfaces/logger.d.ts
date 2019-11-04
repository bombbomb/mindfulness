export interface LoggerInterface {
    log(message: any, payload?: any, options?: object): Promise<any>;
    logError(message: any, payload?: any, options?: object): Promise<string>;
    logInfo(message: any, payload?: any, options?: object): Promise<string>;
    logWarn(message: any, payload?: any, options?: object): Promise<string>;
}
export declare const LOG_LEVELS: {
    LOG_NONE: number;
    LOG_LOG: number;
    LOG_ERROR: number;
    LOG_WARN: number;
    LOG_INFO: number;
    LOG_ALL: number;
};
export interface LoggerLayer {
    type: string;
    handler?: LoggerInterface;
    logLevel?: number;
    [propName: string]: any;
}
export interface L {
    layers: object[];
    before: (message: string, payload?: any) => Promise<{
        message: string;
        payload: any;
        options: object;
    }>;
    after: (err: object) => Promise<any>;
}
