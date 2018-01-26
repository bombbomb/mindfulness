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
var request_promise_native_1 = require("request-promise-native");
var logger_1 = require("../interfaces/logger");
var contrib_logger_1 = require("./contrib_logger");
var contrib_metrics_1 = require("./contrib_metrics");
var logging_1 = require("../util/logging");
var metric_1 = require("../models/metric");
/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
var JsonPostLogger = /** @class */ (function (_super) {
    __extends(JsonPostLogger, _super);
    function JsonPostLogger(options) {
        return _super.call(this, __assign({}, options)) || this;
    }
    /**
     * Send the POST request.
     *
     * @param level Log level as a lowercase string
     * @param message The log message
     * @param payload The payload to include
     * @param options Call-specific options
     */
    JsonPostLogger.prototype.call = function (level, message, payload, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var callOptions, thisMessage, thisPayload, requestOptions, response, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    callOptions = this.getCallOptions(options);
                                    if (!(callOptions.logLevel !== logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.default(level))) return [3 /*break*/, 5];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    thisMessage = (typeof message === 'string') ? message : JSON.stringify(message);
                                    thisPayload = (payload && payload instanceof Error) ? {
                                        message: payload.message,
                                        stack: payload.stack,
                                    } : payload;
                                    requestOptions = this.getRequestOptions({
                                        json: true,
                                        resolveWithFullResponse: true,
                                    }, level, thisMessage, thisPayload, callOptions);
                                    return [4 /*yield*/, request_promise_native_1.default(requestOptions)];
                                case 2:
                                    response = _a.sent();
                                    resolve(response);
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_1 = _a.sent();
                                    reject(e_1);
                                    return [3 /*break*/, 4];
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    resolve();
                                    _a.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Build the request body and hand off to a requestBodyCallback if specified.
     *
     * @param level Log level string
     * @param message Message being logged
     * @param payload Current payload
     * @param options Call-specific options
     */
    JsonPostLogger.prototype.getRequestBody = function (level, message, payload, options) {
        if (payload === void 0) { payload = {}; }
        if (options === void 0) { options = {}; }
        var body = {
            message: message,
            info: payload,
            severity: level,
            type: level,
        };
        var callOptions = this.getCallOptions(options);
        if (callOptions.requestBodyCallback) {
            body = callOptions.requestBodyCallback(body, {
                level: level, message: message, payload: payload, callOptions: callOptions,
            });
        }
        return body;
    };
    /**
     * Get the request() options.
     *
     * @param callRequest The current request() options
     * @param metricType The metric type being called
     * @param metric The metric being updated
     * @param options Call-specific options.
     */
    JsonPostLogger.prototype.getRequestOptions = function (callRequest, level, message, payload, options) {
        var thisCallRequest = request_promise_native_1.default;
        if (options.requestOptionsCallback) {
            var result = options.requestOptionsCallback(thisCallRequest, level, message, payload, options);
            if (result && typeof result === 'object') {
                thisCallRequest = result;
            }
            else {
                console.warn("The results of Metrics.requestOptionsCallback did not return a correct value. Ignoring result with type: " + typeof result);
            }
        }
        var thisRequest = __assign({}, thisCallRequest, { method: 'POST', uri: this.getRequestUri(level, message, payload, options), body: this.getRequestBody(level, message, payload, options) });
        if (typeof thisRequest.body === 'object') {
            thisRequest.json = true;
        }
        return thisRequest;
    };
    /**
     * Get the request URI based on options.
     */
    JsonPostLogger.prototype.getRequestUri = function (level, message, payload, options) {
        var callOptions = this.getCallOptions(options);
        var url = '';
        var scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
        var host = (callOptions.host) ? String(callOptions.host).replace(/^https?:\/\//, '') : 'localhost';
        var port = (callOptions.port) ? Number(callOptions.port) : null;
        var path = (callOptions.path) ? String(callOptions.path) : '/';
        url = scheme + "://" + host;
        if (port) {
            url += ":" + port;
        }
        url += path;
        /* eslint-disable prefer-template */
        url = url.replace(/\$level(\/)?/, level + '$1');
        /* eslint-enable prefer-template */
        return url;
    };
    return JsonPostLogger;
}(contrib_logger_1.default));
exports.JsonPostLogger = JsonPostLogger;
/**
 * JSON POST metrics
 *
 * Passes off a metrics request to a remote endpoint.
 */
var JsonPostMetrics = /** @class */ (function (_super) {
    __extends(JsonPostMetrics, _super);
    function JsonPostMetrics(options) {
        return _super.call(this, __assign({}, options)) || this;
    }
    /**
     * Send the POST request.
     *
     * @param metricType The metric update being made (increment, decrement, timing)
     * @param metric The metric being updated
     * @param options Call-specific options
     */
    JsonPostMetrics.prototype.call = function (metricType, metric, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var callOptions, requestOptions, response, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    callOptions = this.getCallOptions(options);
                                    requestOptions = this.getRequestOptions({
                                        json: true,
                                        resolveWithFullResponse: true,
                                    }, metricType, metric, callOptions);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, request_promise_native_1.default(requestOptions)];
                                case 2:
                                    response = _a.sent();
                                    resolve(response);
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_2 = _a.sent();
                                    reject(e_2);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    JsonPostMetrics.prototype.decrement = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var m, options;
            return __generator(this, function (_a) {
                m = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))();
                options = this.options;
                // in cases where the first argument is a Metric object and the second one is an object,
                // we'll assume that it we're getting: (metric, options)
                if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                    options = args[1];
                }
                return [2 /*return*/, this.call('decrement', new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))(), options)];
            });
        });
    };
    JsonPostMetrics.prototype.increment = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var m, options;
            return __generator(this, function (_a) {
                m = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))();
                options = this.options;
                if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                    options = args[1];
                }
                return [2 /*return*/, this.call('increment', new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))(), options)];
            });
        });
    };
    JsonPostMetrics.prototype.timing = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var m, options;
            return __generator(this, function (_a) {
                m = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))();
                options = this.options;
                if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                    options = args[1];
                }
                return [2 /*return*/, this.call('timing', new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))(), options)];
            });
        });
    };
    /**
     * Get the environment to pass in the body.
     */
    JsonPostMetrics.prototype.getEnvironment = function () {
        if (process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        else if (process.env.ENVIRONMENT) {
            return process.env.ENVIRONMENT;
        }
        return 'production';
    };
    /**
     * Build the request body and hand off to a requestBodyCallback if specified.
     *
     * @param metricType The type of call being made
     * @param metric The metric object being sent
     * @param options Call-specific options
     */
    JsonPostMetrics.prototype.getRequestBody = function (metricType, metric, options) {
        var callOptions = this.getCallOptions(options);
        var dataDefaults = (callOptions.dataDefaults) ? callOptions.dataDefaults : {};
        var body = __assign({ environment: this.getEnvironment(), type: metricType }, dataDefaults);
        if (metric.value) {
            body.value = metric.value;
        }
        if (callOptions.requestBodyCallback) {
            body = callOptions.requestBodyCallback(body, { metricType: metricType, metric: metric, callOptions: callOptions });
        }
        return body;
    };
    /**
     * Get the request() options.
     *
     * @param request The current request() options
     * @param metricType The metric type being called
     * @param metric The metric being updated
     * @param options Call-specific options.
     */
    JsonPostMetrics.prototype.getRequestOptions = function (callRequest, metricType, metric, options) {
        var thisCallRequest = callRequest;
        if (options.requestOptionsCallback) {
            var result = options.requestOptionsCallback(thisCallRequest, metricType, metric, options);
            if (result && typeof result === 'object') {
                thisCallRequest = result;
            }
            else {
                console.warn("The results of Metrics.requestOptionsCallback did not return a correct value. Ignoring result with type: " + typeof result);
            }
        }
        var thisRequest = __assign({}, thisCallRequest, { method: 'POST', uri: this.getRequestUri(metricType, metric, options), body: this.getRequestBody(metricType, metric, options) });
        if (typeof thisRequest.body === 'object') {
            thisRequest.json = true;
        }
        return thisRequest;
    };
    /**
     * Get the request path.
     *
     * @param metricType The metric type being sent
     * @param options An object of options for this call.
     */
    JsonPostMetrics.prototype.getRequestPath = function (metricType, options) {
        if (typeof options.paths !== 'undefined' && typeof options.paths[metricType] !== 'undefined') {
            return options.paths[metricType];
        }
        return (options.path) ? String(options.path) : '/';
    };
    /**
     * Get the request URI based on options.
     */
    JsonPostMetrics.prototype.getRequestUri = function (metricType, metric, options) {
        var callOptions = this.getCallOptions(options);
        var url = '';
        var scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
        var host = (callOptions.host) ? String(callOptions.host) : 'localhost';
        var port = (callOptions.port) ? Number(callOptions.port) : null;
        url = scheme + "://" + host;
        if (port) {
            url += ":" + port;
        }
        url += this.getRequestPath(metricType, callOptions);
        /* eslint-disable prefer-template */
        var category = (metric.category) ? metric.category + '$1' : '';
        url = url.replace(/\$category(\/)?/, category);
        url = url.replace(/\$metric(\/)?/, metric.metric + '$1');
        /* eslint-enable prefer-template */
        return url;
    };
    return JsonPostMetrics;
}(contrib_metrics_1.default));
exports.JsonPostMetrics = JsonPostMetrics;
//# sourceMappingURL=json_post.js.map