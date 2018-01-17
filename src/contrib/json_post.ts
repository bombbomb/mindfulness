import {LoggerInterface, LOG_LEVELS, LoggerOptions} from '../interfaces/logger';

export class JsonPostLogger implements LoggerInterface {
  options: LoggerOptions;

  constructor(options?: object) {
    this.options = {
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options
    };
  }

  call(level: string, message: string, payload?: object, options?: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const callOptions: LoggerOptions = (options) ? options : this.options;
      if (callOptions.logLevel != LOG_LEVELS.LOG_NONE && callOptions.logLevel & this.getLogLevelConstant(level)) {
        const args: (string | object)[] = [message];
        if (payload) {
          args.push(payload);
        }
        console[level].call(this, ...args);
      }
      resolve();
    });
  }

  log(message: string, payload?: object): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.call('log', message, payload);
    });
  }

  logError(message: string, payload?: object): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  logInfo(message: string, payload?: object): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  logWarn(message: string, payload?: object): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }
}
