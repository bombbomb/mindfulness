"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../interfaces/logger");
class ConsoleLogger {
    constructor(parent, options) {
        this.parent = parent;
        this.options = Object.assign({ logLevel: logger_1.LOG_LEVELS.LOG_ALL }, options);
    }
    call(level, message, payload, options) {
        return new Promise((resolve, reject) => {
            const callOptions = (options) ? options : this.options;
            if (callOptions.logLevel != logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & this.getLogLevelConstant(level)) {
                const args = [message];
                if (payload) {
                    args.push(payload);
                }
                console[level].call(this, ...args);
            }
            resolve();
        });
    }
    getLogLevelConstant(level) {
        const levelName = 'LOG_' + level.toUpperCase();
        return logger_1.LOG_LEVELS[levelName];
    }
    log(message, payload) {
        return this.call('log', message, payload);
    }
    logError(message, payload) {
        return this.call('error', message, payload);
    }
    logInfo(message, payload) {
        return this.call('info', message, payload);
    }
    logWarn(message, payload) {
        return this.call('warn', message, payload);
    }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=console.js.map