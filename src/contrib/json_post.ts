import {LoggerInterface, LOG_LEVELS, LoggerOptions} from '../interfaces/logger';

export class JsonPostLogger implements LoggerInterface {
  options: LoggerOptions;

  constructor(options?: object) {
    this.options = {
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options
    };
  }

  log(message: string, payload?: object): Promise<any> {
    return new Promise((resolve, reject) => {

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
