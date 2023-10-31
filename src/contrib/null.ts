/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoggerInterface } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import { MindfulnessOptions } from '../interfaces/options';

/**
 * Log messages to nothing.
 */
export class NullLogger extends ContribLogger implements LoggerInterface {
  options: MindfulnessOptions;

  /**
   * The log message handler.
   *
   * @param _level The log level to use.
   * @param _message The message or item to log
   * @param _payload Optional additional payload to log
   * @param _options Optional call-specific options for this log.
   */
  async call(_level: string, _message: unknown, _payload?: unknown, _options?: MindfulnessOptions): Promise<unknown> {
    return Promise.resolve();
  }
}

/**
 * Log metrics out to nothing.
 */
export class NullMetrics extends ContribMetrics implements MetricsInterface {
  async call(...args: unknown[]): Promise<unknown> {
    return Promise.resolve();
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
