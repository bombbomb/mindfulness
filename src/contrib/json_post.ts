import request from 'request-promise-native';
import {LoggerInterface, LOG_LEVELS, LoggerOptions, L} from '../interfaces/logger';
import {getLogLevelConstant} from '../util/logging';

export class JsonPostLogger implements LoggerInterface {
  options: LoggerOptions;
  parent: L;

  constructor(parent: L, options?: object) {
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
  async call(level: string, message: string, payload?: object, options?: object): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions: LoggerOptions = (options) ? options : this.options;
      if (callOptions.logLevel != LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
        const requestOptions = {
          method: 'POST',
          uri: this.getRequestUri(),
          body: {
            message,
            info: (payload) ? payload : {},
            severity: level,
            type: level,
          },
          json: true
        };
        console.log(requestOptions);

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

  getRequestUri(): string {
    let url = '';

    const scheme = (this.options.scheme) ? this.options.scheme : 'http';
    const host = (this.options.host) ? String(this.options.host) : 'localhost';
    const port = (this.options.port) ? Number(this.options.port) : null;
    const path = (this.options.path) ? String(this.options.path) : '/';

    url = scheme + '://' + host;
    if (port) {
      url += ':' + port;
    }

    url += path;

    return url;
  }

  async log(message: string, payload?: object): Promise<any> {
    return this.call('log', message, payload);
  }

  async logError(message: string, payload?: object): Promise<any> {
    return this.call('error', message, payload);
  }

  async logInfo(message: string, payload?: object): Promise<any> {
    return this.call('info', message, payload);
  }

  async logWarn(message: string, payload?: object): Promise<any> {
    return this.call('warn', message, payload);
  }
}
