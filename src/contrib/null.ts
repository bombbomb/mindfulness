import { LoggerInterface, LOG_LEVELS, LoggerOptions, L } from '../interfaces/logger';
import getLogLevelConstant from '../util/logging';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import Metric from '../models/metric';

/**
 * Log messages to nothing.
 */
export class NullLogger extends ContribLogger implements LoggerInterface {
  options: LoggerOptions;

  /**
   * The log message handler.
   *
   * @param level The log level to use.
   * @param message The message or item to log
   * @param payload Optional additional payload to log
   * @param options Optional call-specific options for this log.
   */
  async call(level: string, message: any, payload?: any, options?: LoggerOptions): Promise<any> {
    return Promise.resolve();
  }
}

/**
 * Log metrics out to nothing.
 */
export class NullMetrics extends ContribMetrics implements MetricsInterface {
  async call(metricType: string, ...args: any[]): Promise<any> {
    return Promise.resolve();
  }

  async increment(...args: any[]): Promise<any> {
    return this.call('increment', ...args);
  }

  async timing(...args: any[]): Promise<any> {
    return this.call('timing', ...args);
  }
}
