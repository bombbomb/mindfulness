import {LoggerInterface, LOG_LEVELS, LoggerOptions, L} from '../interfaces/logger';

export class ConsoleLogger implements LoggerInterface {
  options: LoggerOptions;
  parent: L;

  constructor(parent: L, options?: object) {
    this.parent = parent;
    this.options = {
      logLevel: LOG_LEVELS.LOG_ALL,
      ...options
    };
  }

  call(level: string, message: string, payload?: object, options?: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const callOptions: LoggerOptions = (options) ? options : this.options;
      if (callOptions.logLevel != LOG_LEVELS.LOG_NONE && callOptions.logLevel & this.getLogLevelConstant(level)) {
        const args: (string|object)[] = [message];
        if (payload) {
          args.push(payload);
        }
        console[level].call(this, ...args);
      }
      resolve();
    });
  }

  getLogLevelConstant(level: string) {
    const levelName = 'LOG_' + level.toUpperCase();
    return LOG_LEVELS[levelName];
  }

  log(message: string, payload?: object): Promise<any> {
    return this.call('log', message, payload);
  }

  logError(message: string, payload?: object): Promise<any> {
    return this.call('error', message, payload);
  }

  logInfo(message: string, payload?: object): Promise<any> {
    return this.call('info', message, payload);
  }

  logWarn(message: string, payload?: object): Promise<any> {
    return this.call('warn', message, payload);
  }
}
