"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../interfaces/logger");
class JsonPostLogger {
    constructor(options) {
        this.options = Object.assign({ logLevel: logger_1.LOG_LEVELS.LOG_ALL }, options);
    }
    log(message, payload) {
        return new Promise((resolve, reject) => {
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