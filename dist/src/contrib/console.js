"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../interfaces/logger");
const logging_1 = require("../util/logging");
class ConsoleLogger {
    constructor(parent, options) {
        this.parent = parent;
        this.options = Object.assign({ logLevel: logger_1.LOG_LEVELS.LOG_ALL }, options);
    }
    call(level, message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const callOptions = (options) ? options : this.options;
                if (callOptions.logLevel != logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.getLogLevelConstant(level)) {
                    const args = [message];
                    if (payload) {
                        args.push(payload);
                    }
                    console[level].call(this, ...args);
                }
                resolve();
            });
        });
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