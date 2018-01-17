"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../interfaces/logger");
class JsonPostLogger {
    constructor(options) {
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
    log(message, payload) {
        return new Promise((resolve, reject) => {
            return this.call('log', message, payload);
        });
    }
    logError(message, payload) {
        return new Promise((resolve, reject) => {
        });
    }
    logInfo(message, payload) {
        return new Promise((resolve, reject) => {
        });
    }
    logWarn(message, payload) {
        return new Promise((resolve, reject) => {
        });
    }
}
exports.JsonPostLogger = JsonPostLogger;
//# sourceMappingURL=json_post.js.map