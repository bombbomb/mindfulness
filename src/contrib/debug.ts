import Debug from 'debug';
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
export class DebugLogger extends ContribLogger implements LoggerInterface {
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
      const debugInstance = Debug(callOptions.namespace);
      debugInstance(message, payload);
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

      const consoleObject = this.options.console || console;
      consoleObject.info(message);
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
