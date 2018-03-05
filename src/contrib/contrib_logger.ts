import { LoggerInterface, LOG_LEVELS, LoggerOptions, L } from '../interfaces/logger';
import Mindfulness from './mindfulness';
import { MindfulnessOptions } from '../interfaces/options';

export default class ContribLogger extends Mindfulness {
  type = 'logger';

  constructor(options?: MindfulnessOptions) {
    super({
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options,
    });
  }

  async call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  /**
   * Log a message to console.log
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async log(message: any, payload?: object, options?: MindfulnessOptions): Promise<any> {
    return this.call('log', message, payload, options);
  }

  /**
   * Log a message to console.error
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logError(message: any, payload?: object, options?: MindfulnessOptions): Promise<any> {
    return this.call('error', message, payload, options);
  }

  /**
   * Log a message to console.info
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logInfo(message: any, payload?: object, options?: MindfulnessOptions): Promise<any> {
    return this.call('info', message, payload, options);
  }

  /**
   * Log a message to console.warn
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logWarn(message: any, payload?: object): Promise<any> {
    return this.call('warn', message, payload);
  }
}
