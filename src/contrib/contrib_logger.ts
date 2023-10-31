import { LOG_LEVELS, LoggerBeforeResult } from '../interfaces/logger';
import Mindfulness from './mindfulness';
import { MindfulnessOptions } from '../interfaces/options';

export default abstract class ContribLogger extends Mindfulness<LoggerBeforeResult> {
  active = false;

  type = 'logger';

  constructor(options?: MindfulnessOptions) {
    super({
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options,
    });
  }

  abstract call(level: string, message: unknown, payload?: unknown, options?: MindfulnessOptions): Promise<unknown>

  /**
   * Log a message to console.log
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async log(message: unknown, payload?: object, options?: MindfulnessOptions): Promise<unknown> {
    return this.call('log', message, payload, options);
  }

  /**
   * Log a message to console.error
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logError(message: unknown, payload?: object, options?: MindfulnessOptions): Promise<unknown> {
    return this.call('error', message, payload, options);
  }

  /**
   * Log a message to console.info
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logInfo(message: unknown, payload?: object, options?: MindfulnessOptions): Promise<unknown> {
    return this.call('info', message, payload, options);
  }

  /**
   * Log a message to console.warn
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logWarn(message: unknown, payload?: object): Promise<unknown> {
    return this.call('warn', message, payload);
  }
}
