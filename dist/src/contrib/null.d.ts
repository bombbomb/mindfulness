import { LoggerInterface } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import { MindfulnessOptions } from '../interfaces/options';
/**
 * Log messages to nothing.
 */
export declare class NullLogger extends ContribLogger implements LoggerInterface {
    options: MindfulnessOptions;
    /**
     * The log message handler.
     *
     * @param level The log level to use.
     * @param message The message or item to log
     * @param payload Optional additional payload to log
     * @param options Optional call-specific options for this log.
     */
    call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any>;
}
/**
 * Log metrics out to nothing.
 */
export declare class NullMetrics extends ContribMetrics implements MetricsInterface {
    call(metricType: string, ...args: any[]): Promise<any>;
    increment(...args: any[]): Promise<any>;
    timing(...args: any[]): Promise<any>;
}
