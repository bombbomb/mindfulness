import request from 'request-promise-native';
import {LoggerInterface, LOG_LEVELS, LoggerOptions, L} from '../interfaces/logger';
import {getLogLevelConstant} from '../util/logging';

/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
export class JsonPostLogger implements LoggerInterface {
  options: LoggerOptions;
  parent: L;

  constructor(parent: L, options?: LoggerOptions) {
    this.parent = parent;
    this.options = {
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options
    };
  }

  /**
   * Send the POST request.
   *
   * @param level Log level as a lowercase string
   * @param message The log message
   * @param payload The payload to include
   * @param options Call-specific options
   */
  async call(level: string, message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions = this.getCallOptions(options);
      if (callOptions.logLevel != LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {

        try {
          if (typeof message !== 'string') {
            message = JSON.stringify(message);
          }

          if (payload && payload instanceof Error) {
            payload = {
              message: payload.message,
              stack: payload.stack
            };
          }
        }
        catch (e) {
          reject(e);
        }

        const requestOptions = {
          body: this.getRequestBody(level, message, payload, options),
          method: 'POST',
          uri: this.getRequestUri(options),
          json: true
        };

        try {
          const response = await request(requestOptions);
          resolve(response);
        }
        catch (e) {
          reject(e);
        }
      }
      else {
        resolve();
      }
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
  getCallOptions(options?: LoggerOptions) : LoggerOptions {
    return (options) ? {
      ...this.options,
      ...options
    } : this.options;
  }

  /**
   * Build the request body and hand off to a requestHandler if specified.
   *
   * @param level Log level string
   * @param message Message being logged
   * @param payload Current payload
   * @param options Call-specific options
   */
  getRequestBody(level: string, message: any, payload?: object, options?: LoggerOptions): object {
    let body = {
      message,
      info: (payload) ? payload : {},
      severity: level,
      type: level
    };

    const callOptions = this.getCallOptions(options);

    if (callOptions.requestHandler) {
      body = callOptions.requestHandler(body, {level, message, payload, callOptions});
    }

    return body;
  }

  /**
   * Get the request URI based on options.
   */
  getRequestUri(options?: LoggerOptions): string {
    const callOptions = this.getCallOptions(options);

    let url = '';

    const scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
    const host = (callOptions.host) ? String(callOptions.host) : 'localhost';
    const port = (callOptions.port) ? Number(callOptions.port) : null;
    const path = (callOptions.path) ? String(callOptions.path) : '/';

    url = scheme + '://' + host;
    if (port) {
      url += ':' + port;
    }

    url += path;

    return url;
  }

  async log(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return this.call('log', message, payload, options);
  }

  async logError(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return this.call('error', message, payload, options);
  }

  async logInfo(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return this.call('info', message, payload, options);
  }

  async logWarn(message: any, payload?: object, options?: LoggerOptions): Promise<any> {
    return this.call('warn', message, payload, options);
  }
}
