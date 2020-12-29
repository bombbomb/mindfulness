import { L, LoggerLayer } from './interfaces/logger';
import { M, MetricInterface } from './interfaces/metrics';
import { MindfulnessOptions } from './interfaces/options';
/**
 * Base mindfulness class used for Logger and Metrics.
 */
declare abstract class MindfulnessBase {
    options: MindfulnessOptions;
    layers: any[];
    errors: any[];
    /**
     * Make sure all layers are active.
     */
    activateAllLayers(): this;
    /**
     * Handle an "after" function.
     *
     * Runs after all layers have finished.
     *
     * @param results Results from all logging layers
     */
    after(results: any): Promise<void>;
    /**
     * Deactivate all layers.
     */
    deactivateAllLayers(): this;
    /**
     * Error handler.
     *
     * Handles general error behavior and will also handle calling
     * an onError handler if one is present.
     *
     * @param error Error
     */
    errorHandler(error: any): Promise<any>;
    /**
     * Filter the active layers for one call.
     *
     * @param filter A string or a callback to filter with
     */
    filterLayers(filter: any): this;
    /**
     * Get the options for a specific call.
     *
     * Basically will return an options object for a specific call merged with the logger's
     * default options.
     *
     * @param options Call specific options
     */
    getCallOptions(options?: MindfulnessOptions): MindfulnessOptions;
}
/**
 * Logger class.
 *
 * A logger instance may represent one or more layers of logging. Each
 * layer represents an output (console, POST request, file, etc).
 */
export declare class Logger extends MindfulnessBase implements L {
    static LOG_LEVELS: {
        LOG_NONE: number;
        LOG_LOG: number;
        LOG_ERROR: number;
        LOG_WARN: number;
        LOG_INFO: number;
        LOG_ALL: number;
    };
    /**
     * Build our logger object.
     *
     * @param layers The logging layers to include.
     */
    constructor(layers?: (string | LoggerLayer)[], options?: {});
    /**
     * Handle a "before" function.
     *
     * These functions can be used to modify for a specific request. Before functions
     *
     * @param message The message being logged
     * @param payload The payload being logged
     * @param options The settings for this call
     */
    before(message: any, payload?: object, options?: object): Promise<any>;
    /**
     * Used to log messages.
     *
     * Dynamically bound to the various methods in the constructor.
     *
     * @param logLevel Log level to use for this message
     * @param message The message
     * @param payload optional payload object
     */
    call(logLevel: string, message: any, payload?: any, options?: object): Promise<void>;
    /**
     * Log a message to the "log" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    log(message: any, payload?: any, options?: object): Promise<void>;
    /**
     * Log a message to the "error" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    logError(message: any, payload?: any, options?: object): Promise<void>;
    /**
     * Log a message to the "info" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    logInfo(message: any, payload?: any, options?: object): Promise<void>;
    /**
     * Log a message to the "warn" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    logWarn(message: any, payload?: any, options?: object): Promise<void>;
    /**
     * Alias for logWarn
     */
    logWarning(message: any, payload?: any, options?: object): Promise<void>;
    silent(): this;
}
/**
 * Metrics sending class
 *
 * Send metrics to a metrics server via console or JSON POST.
 */
export declare class Metrics extends MindfulnessBase implements M {
    /**
     * Constructor.
     *
     * @param layers Metrics handler layers
     * @param options Options for this metrics object.
     */
    constructor(layers?: any[], options?: MindfulnessOptions);
    /**
     * Process any before handlers.
     *
     * @param metricType The metric type being called
     * @param metric The Metric object
     * @param options Current options for this call.
     */
    before(metricType: string, metric: MetricInterface, options?: MindfulnessOptions): Promise<any>;
    /**
     * Handle increment calls.
     *
     * This will handle the before & after functionality and pass this
     * on to each metric layer as needed.
     *
     * @param metricType The metric type being called
     * @param args Args
     */
    call(metricType: string, ...args: any[]): Promise<any>;
    decrement(...args: any[]): Promise<any>;
    increment(...args: any[]): Promise<any>;
    timing(...args: any[]): Promise<any>;
    silent(): this;
}
export {};
