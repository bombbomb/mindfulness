"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../interfaces/logger");
var logging_1 = require("../util/logging");
var contrib_logger_1 = require("./contrib_logger");
var contrib_metrics_1 = require("./contrib_metrics");
var metric_1 = require("../models/metric");
/**
 * Log messages to the console.
 */
var ConsoleLogger = /** @class */ (function (_super) {
    __extends(ConsoleLogger, _super);
    function ConsoleLogger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * The log message handler.
     *
     * @param level The log level to use.
     * @param message The message or item to log
     * @param payload Optional additional payload to log
     * @param options Optional call-specific options for this log.
     */
    ConsoleLogger.prototype.call = function (level, message, payload, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var callOptions = _this.getCallOptions(options);
                        if (callOptions.logLevel !== logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.default(level)) {
                            var args = [message];
                            if (payload) {
                                args.push(__assign({}, payload));
                            }
                            if (typeof console[level] === 'undefined') {
                                return reject(new Error("Invalid log level: " + level));
                            }
                            (_a = console[level]).call.apply(_a, [_this].concat(args));
                        }
                        return resolve();
                        var _a;
                    })];
            });
        });
    };
    return ConsoleLogger;
}(contrib_logger_1.default));
exports.ConsoleLogger = ConsoleLogger;
/**
 * Log metrics out to the console.
 */
var ConsoleMetrics = /** @class */ (function (_super) {
    __extends(ConsoleMetrics, _super);
    function ConsoleMetrics() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConsoleMetrics.prototype.call = function (metricType) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var m = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))();
                        var value = (m.value) ? Math.abs(Number(m.value)) : 1;
                        var message = '';
                        switch (metricType) {
                            case 'decrement':
                                message = "metrics: " + m.toString() + ": -" + value;
                                break;
                            case 'increment':
                                message = "metrics: " + m.toString() + ": +" + value;
                                break;
                            default:
                                message = "metrics: " + m.toString() + ": " + m.value;
                        }
                        console.info(message);
                        resolve({ metric: m });
                    })];
            });
        });
    };
    ConsoleMetrics.prototype.decrement = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.call.apply(this, ['decrement'].concat(args))];
            });
        });
    };
    ConsoleMetrics.prototype.increment = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.call.apply(this, ['increment'].concat(args))];
            });
        });
    };
    ConsoleMetrics.prototype.timing = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.call.apply(this, ['timing'].concat(args))];
            });
        });
    };
    return ConsoleMetrics;
}(contrib_metrics_1.default));
exports.ConsoleMetrics = ConsoleMetrics;
//# sourceMappingURL=console.js.map