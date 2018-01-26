import { LoggerInterface, LOG_LEVELS, LoggerOptions, L } from '../interfaces/logger';

export default class ContribLogger {
  options: LoggerOptions;

  constructor(options?: LoggerOptions) {
    this.options = {
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options,
    };
  }

  async call(level: string, message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  /**
   * Get the options for a specific call.
   *
   * Basically will return an options object for a specific call merged with the logger's
   * default options.
   *
   * @param options Call specific options
   */
  getCallOptions(options?: LoggerOptions): LoggerOptions {
    // if we have call options, override the defaults or just return the defaults.
    return (options) ? {
      ...this.options,
      ...options,
    } : { ...this.options };
  }

  /**
   * Log a message to console.log
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async log(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return this.call('log', message, payload, options);
  }

  /**
   * Log a message to console.error
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logError(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return this.call('error', message, payload, options);
  }

  /**
   * Log a message to console.info
   * @param message Message or item to log
   * @param payload Additional payload to log
   * @param options Optional call-specific options
   */
  async logInfo(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
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
