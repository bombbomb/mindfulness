import { LoggerInterface, LOG_LEVELS, LoggerOptions, L } from '../interfaces/logger';
import getLogLevelConstant from '../util/logging';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import Metric from '../models/metric';

export class ConsoleLogger extends ContribLogger implements LoggerInterface {
  options: LoggerOptions;

  /**
   * The log message handler.
   *
   * @param level The log level to use.
   * @param message The message or item to log
   * @param payload Optional additional payload to log
   * @param options Optional call-specific options for this log.
   */
  async call(level: string, message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const callOptions = this.getCallOptions(options);
      if (callOptions.logLevel !== LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
        const args: (string|object)[] = [message];
        if (payload) {
          args.push({ ...payload });
        }
        if (typeof console[level] === 'undefined') {
          return reject(new Error(`Invalid log level: ${level}`));
        }
        console[level].call(this, ...args);
      }
      return resolve();
    });
  }
}

export class ConsoleMetrics extends ContribMetrics implements MetricsInterface {
  async decrement(...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const m = new Metric(...args);
      const value = (m.value) ? Math.abs(Number(m.value)) : 1;
      console.info(`metrics: ${m.toString()}: -${value}`);
      resolve({ metric: m });
    });
  }

  async increment(...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const m = new Metric(...args);
      const value = (m.value) ? Math.abs(Number(m.value)) : 1;
      console.info(`metrics: ${m.toString()}: +${value}`);
      resolve({ metric: m });
    });
  }

  async timing(...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const m = new Metric(...args);
      console.info(`metrics: ${m.toString()}: ${m.value}`);
      resolve({ metric: m });
    });
  }
}
