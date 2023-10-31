import { LoggerInterface, LOG_LEVELS } from '../interfaces/logger';
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
  async call(level: string, message: string, payload?: unknown, options?: MindfulnessOptions): Promise<void> {
    const callOptions = this.getCallOptions(options);

    const consoleObject = callOptions.console || console;

    if (typeof consoleObject[level] === 'undefined') {
      throw new Error(`Invalid log level: ${level}`);
    }

    // call & wait for our before handlers
    const beforeResult = await this.before({ message, payload }, callOptions);
    if (callOptions.logLevel !== LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
      const args: (string|object)[] = [beforeResult.message];
      if (beforeResult.payload && typeof beforeResult.payload === 'object') {
        args.push({ ...beforeResult.payload });
      }
      consoleObject[level].apply(this, args);
    }
  }
}

/**
 * Log metrics out to the console.
 */
export class ConsoleMetrics extends ContribMetrics implements MetricsInterface {
  async call(metricType: string, ...args: unknown[]): Promise<unknown> {
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
    return { metric: beforeResult.metric };
  }

  async decrement(...args: unknown[]): Promise<unknown> {
    return this.call('decrement', ...args);
  }

  async increment(...args: unknown[]): Promise<unknown> {
    return this.call('increment', ...args);
  }

  async timing(...args: unknown[]): Promise<unknown> {
    return this.call('timing', ...args);
  }
}
