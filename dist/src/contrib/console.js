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
const contrib_logger_1 = require("./contrib_logger");
const contrib_metrics_1 = require("./contrib_metrics");
const metric_1 = require("../models/metric");
class ConsoleLogger extends contrib_logger_1.default {
    /**
     * The log message handler.
     *
     * @param level The log level to use.
     * @param message The message or item to log
     * @param payload Optional additional payload to log
     * @param options Optional call-specific options for this log.
     */
    call(level, message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const callOptions = this.getCallOptions(options);
                if (callOptions.logLevel != logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.getLogLevelConstant(level)) {
                    const args = [message];
                    if (payload) {
                        args.push(Object.assign({}, payload));
                    }
                    console[level].call(this, ...args);
                }
                resolve();
            });
        });
    }
}
exports.ConsoleLogger = ConsoleLogger;
class ConsoleMetrics extends contrib_metrics_1.default {
    decrement(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const m = new metric_1.default(...args);
                console.info('metrics: ' + m.toString() + ': -' + (m.value) ? Math.abs(Number(m.value)) : 1);
                resolve();
            });
        });
    }
    increment(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const m = new metric_1.default(...args);
                console.info('metrics: ' + m.toString() + ': +' + (m.value) ? Math.abs(Number(m.value)) : 1);
                resolve();
            });
        });
    }
    timing(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const m = new metric_1.default(...args);
                console.info('metrics: ' + m.toString() + ': ' + m.value);
                resolve();
            });
        });
    }
}
exports.ConsoleMetrics = ConsoleMetrics;
//# sourceMappingURL=console.js.map