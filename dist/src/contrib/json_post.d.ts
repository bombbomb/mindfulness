import { LoggerInterface } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import { MindfulnessOptions, DetailsInterface } from '../interfaces/options';
import Metric from '../models/metric';
import Mindfulness from './mindfulness';
export declare class JsonPostHandler {
    parentObject: Mindfulness;
    version: string;
    constructor(parent: Mindfulness);
    /**
     * Build a message body from a message template.
     *
     * @param details Body message details
     * @param options Request options
     */
    buildBody(details: object, options: MindfulnessOptions): Promise<object>;
    /**
     * Build the request body and hand off to a requestBodyCallback if specified.
     *
     * @param level Log level string
     * @param message Message being logged
     * @param payload Current payload
     * @param options Call-specific options
     */
    getRequestBody(details: DetailsInterface, options?: MindfulnessOptions): Promise<object>;
    /**
     * Get the request() options.
     *
     * @param callRequest The current request() options
     * @param metricType The metric type being called
     * @param metric The metric being updated
     * @param options Call-specific options.
     */
    getRequestOptions(callRequest: object, details: DetailsInterface, options: MindfulnessOptions): Promise<object>;
    /**
     * Get the request path.
     *
     * @param metricType The metric type being sent
     * @param options An object of options for this call.
     */
    getRequestPath(details: DetailsInterface, options: MindfulnessOptions): any;
    getRequestScheme(options: any): any;
    /**
     * Get the request URI based on options.
     */
    getRequestUri(details: DetailsInterface, options?: MindfulnessOptions): string;
    post(details: object, options: MindfulnessOptions): Promise<any>;
}
/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
export declare class JsonPostLogger extends ContribLogger implements LoggerInterface {
    json: JsonPostHandler;
    constructor(options?: MindfulnessOptions);
    /**
     * Send the POST request.
     *
     * @param level Log level as a lowercase string
     * @param message The log message
     * @param payload The payload to include
     * @param options Call-specific options
     */
    call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any>;
    getMessage(message: any): string;
    getPayload(payload: any): any;
}
/**
 * JSON POST metrics
 *
 * Passes off a metrics request to a remote endpoint.
 */
export declare class JsonPostMetrics extends ContribMetrics implements MetricsInterface {
    json: JsonPostHandler;
    constructor(options?: MindfulnessOptions);
    /**
     * Send the POST request.
     *
     * @param metricType The metric update being made (increment, decrement, timing)
     * @param metric The metric being updated
     * @param options Call-specific options
     */
    call(metricType: string, metric: Metric, options?: MindfulnessOptions): Promise<any>;
    debug(...args: any[]): void;
    /**
     * Used to create the list of arguments each metric function uses
     *
     * @param args Arguments array
     */
    settleArguments(...args: any[]): {
        args: any[];
        metric: Metric;
        options: object;
    };
    increment(...args: any[]): Promise<any>;
    timing(...args: any[]): Promise<any>;
}
