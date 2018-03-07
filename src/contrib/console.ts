import { LoggerInterface, LOG_LEVELS, L } from '../interfaces/logger';
import getLogLevelConstant from '../util/logging';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import Metric from '../models/metric';
import { MindfulnessOptions } from '../interfaces/options';

/**
 * Log messages to the console.
 */
export class ConsoleLogger extends ContribLogger implements LoggerInterface {
  options: MindfulnessOptions;

  /**
   * The log message handler.
   *
   * @param level The log level to use.
   * @param message The message or item to log
   * @param payload Optional additional payload to log
   * @param options Optional call-specific options for this log.
   */
  async call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions = this.getCallOptions(options);

      if (typeof console[level] === 'undefined') {
        return reject(new Error(`Invalid log level: ${level}`));
      }

      // call & wait for our before handlers
      const beforeResult = await this.before({ message, payload }, callOptions);

      if (callOptions.logLevel !== LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
        const args: (string|object)[] = [beforeResult.message];
        if (beforeResult.payload && typeof beforeResult.payload === 'object') {
          args.push({ ...beforeResult.payload });
        }
        console[level].apply(this, args);
      }
      return resolve();
    });
  }
}

/**
 * Log metrics out to the console.
 */
export class ConsoleMetrics extends ContribMetrics implements MetricsInterface {
  async call(metricType: string, ...args: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const m = new Metric(...args);

      // call & wait for our before handlers
      const beforeResult = await this.before({ metricType, metric: m }, this.options);

      const value = (beforeResult.metric.value) ? Math.abs(Number(beforeResult.metric.value)) : 1;
      let message = '';
      switch (metricType) {
        case 'decrement':
          message = `metrics: ${beforeResult.metric.toString()}: -${value}`;
          break;
        case 'increment':
          message = `metrics: ${beforeResult.metric.toString()}: +${value}`;
          break;
        default:
          message = `metrics: ${beforeResult.metric.toString()}: ${beforeResult.metric.value}`;
      }

      console.info(message);
      resolve({ metric: beforeResult.metric });
    });
  }

  async increment(...args: any[]): Promise<any> {
    return this.call('increment', ...args);
  }

  async timing(...args: any[]): Promise<any> {
    return this.call('timing', ...args);
  }
}
