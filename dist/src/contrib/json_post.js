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
// import request from 'request-promise-native';
var lodash_get_1 = require("lodash.get");
var logger_1 = require("../interfaces/logger");
var contrib_logger_1 = require("./contrib_logger");
var contrib_metrics_1 = require("./contrib_metrics");
var logging_1 = require("../util/logging");
var metric_1 = require("../models/metric");
var version_1 = require("../util/version");
// need to use require() syntax because this package does not define default...
var request = require('request-promise-native');
var JsonPostHandler = /** @class */ (function () {
    function JsonPostHandler(parent) {
        this.parentObject = parent;
    }
    JsonPostHandler.prototype.buildBody = function (details, options) {
        return __awaiter(this, void 0, void 0, function () {
            var body, _a, keys, variables, index, key, value, keyName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = {};
                        if (!!this.version) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, version_1.default()];
                    case 1:
                        _a.version = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (options.messageTemplate) {
                            keys = Object.keys(options.messageTemplate);
                            variables = __assign({ $environment: this.parentObject.getEnvironment(), $version: this.version }, details);
                            console.info({ variables: variables });
                            for (index = 0; index < keys.length; index += 1) {
                                key = keys[index];
                                value = options.messageTemplate[key];
                                // optional item
                                if (/\?$/.test(key)) {
                                    keyName = key.replace(/\?$/, '');
                                    if (Array.isArray(value)) {
                                        if (typeof variables[value[0]] !== 'undefined') {
                                            body[keyName] = variables[value[0]];
                                        }
                                        else {
                                            body[keyName] = value[1];
                                        }
                                    }
                                    else if (typeof variables[value] !== 'undefined') {
                                        body[keyName] = variables[value];
                                    }
                                    else if (lodash_get_1.default(details, value)) {
                                        body[keyName] = lodash_get_1.default(details, value);
                                    }
                                }
                                else if (value in variables) {
                                    body[key] = variables[value];
                                }
                                else if (lodash_get_1.default(details, value)) {
                                    body[key] = lodash_get_1.default(details, value);
                                }
                            }
                        }
                        return [2 /*return*/, Promise.resolve(body)];
                }
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
    JsonPostHandler.prototype.getRequestBody = function (details, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var dataDefaults, builtBody, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataDefaults = (options.dataDefaults) ? options.dataDefaults : {};
                        return [4 /*yield*/, this.buildBody(details, options)];
                    case 1:
                        builtBody = _a.sent();
                        body = __assign({}, builtBody, dataDefaults);
                        if (options.requestBodyCallback) {
                            body = options.requestBodyCallback(body, __assign({}, details, { options: options }));
                        }
                        return [2 /*return*/, body];
                }
            });
        });
    };
    /**
     * Get the request() options.
     *
     * @param callRequest The current request() options
     * @param metricType The metric type being called
     * @param metric The metric being updated
     * @param options Call-specific options.
     */
    JsonPostHandler.prototype.getRequestOptions = function (callRequest, details, options) {
        return __awaiter(this, void 0, void 0, function () {
            var thisCallRequest, result, thisRequest, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        thisCallRequest = callRequest;
                        if (options.requestOptionsCallback) {
                            result = options.requestOptionsCallback(thisCallRequest, details, options);
                            if (result && typeof result === 'object') {
                                thisCallRequest = result;
                            }
                            else {
                                console.warn("The results of Metrics.requestOptionsCallback did not return a correct value. Ignoring result with type: " + typeof result);
                            }
                        }
                        _a = [{}, thisCallRequest];
                        _b = { method: 'POST', uri: this.getRequestUri(details, options) };
                        return [4 /*yield*/, this.getRequestBody(details, options)];
                    case 1:
                        thisRequest = __assign.apply(void 0, _a.concat([(_b.body = _c.sent(), _b)]));
                        if (typeof thisRequest.body === 'object') {
                            thisRequest.json = true;
                        }
                        return [2 /*return*/, Promise.resolve(thisRequest)];
                }
            });
        });
    };
    /**
     * Get the request path.
     *
     * @param metricType The metric type being sent
     * @param options An object of options for this call.
     */
    JsonPostHandler.prototype.getRequestPath = function (details, options) {
        if (typeof details.metricType !== 'undefined') {
            if (typeof options.paths !== 'undefined' && typeof options.paths[details.metricType] !== 'undefined') {
                return options.paths[details.metricType];
            }
        }
        return (options.path) ? String(options.path) : '/';
    };
    JsonPostHandler.prototype.getRequestScheme = function (options) {
        var scheme = (options.scheme) ? options.scheme : 'http';
        // check the host to see if it has http/https in it...
        var host = /^(https?):\/\//.exec(options.host);
        if (host) {
            scheme = host[1];
        }
        return scheme;
    };
    /**
     * Get the request URI based on options.
     */
    JsonPostHandler.prototype.getRequestUri = function (details, options) {
        var callOptions = this.parentObject.getCallOptions(options);
        var url = '';
        var scheme = this.getRequestScheme(callOptions);
        var host = (callOptions.host) ? String(callOptions.host).replace(/^https?:\/\//, '') : 'localhost';
        var port = (callOptions.port) ? Number(callOptions.port) : null;
        var path = this.getRequestPath(details, options);
        if (host.slice(-1) === '/') {
            host = host.slice(0, -1);
        }
        if (path[0] !== '/') {
            path = "/" + path;
        }
        url = scheme + "://" + host;
        if (port) {
            url += ":" + port;
        }
        url += path;
        /* eslint-disable prefer-template */
        if (typeof details.level !== 'undefined') {
            url = url.replace(/\$level(\/)?/, details.level + '$1');
        }
        if (typeof details.metric !== 'undefined') {
            var category = (details.metric.category) ? details.metric.category + '$1' : '';
            url = url.replace(/\$category(\/)?/, category);
            url = url.replace(/\$metric(\/)?/, details.metric.metric + '$1');
        }
        /* eslint-enable prefer-template */
        return url;
    };
    JsonPostHandler.prototype.post = function (details, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requestOptions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.version) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, version_1.default()];
                    case 1:
                        _a.version = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.getRequestOptions({
                            json: true,
                            resolveWithFullResponse: true,
                            headers: {
                                'User-Agent': "mindfulness/" + this.version,
                            },
                        }, details, options)];
                    case 3:
                        requestOptions = _b.sent();
                        this.parentObject.debug('mindfulness logging', { requestOptions: requestOptions });
                        return [2 /*return*/, request(requestOptions)];
                }
            });
        });
    };
    return JsonPostHandler;
}());
exports.JsonPostHandler = JsonPostHandler;
/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
var JsonPostLogger = /** @class */ (function (_super) {
    __extends(JsonPostLogger, _super);
    function JsonPostLogger(options) {
        var _this = _super.call(this, __assign({ messageTemplate: {
                message: 'message',
                'info?': ['payload', {}],
                environment: '$environment',
                severity: 'level',
                type: 'level',
            } }, options)) || this;
        _this.json = new JsonPostHandler(_this);
        return _this;
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
                        var callOptions, beforeResult, thisMessage, thisPayload, response, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    callOptions = this.getCallOptions(options);
                                    return [4 /*yield*/, this.before({ message: message, payload: payload }, callOptions)];
                                case 1:
                                    beforeResult = _a.sent();
                                    if (!(callOptions.logLevel !== logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.default(level))) return [3 /*break*/, 6];
                                    thisMessage = this.getMessage(beforeResult.message);
                                    thisPayload = this.getPayload(beforeResult.payload);
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, this.json.post({ level: level, message: thisMessage, payload: thisPayload }, callOptions)];
                                case 3:
                                    response = _a.sent();
                                    resolve(response);
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_1 = _a.sent();
                                    this.debug('mindfulness logging error', e_1);
                                    reject(e_1);
                                    return [3 /*break*/, 5];
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    resolve();
                                    _a.label = 7;
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    JsonPostLogger.prototype.getMessage = function (message) {
        if (typeof message === 'string') {
            return message;
        }
        if (typeof message === 'object' && message instanceof Error) {
            return message.message;
        }
        return JSON.stringify(message);
    };
    JsonPostLogger.prototype.getPayload = function (payload) {
        if (typeof payload === 'object') {
            if (payload instanceof Error) {
                return {
                    message: payload.message,
                    stack: payload.stack,
                };
            }
            return __assign({}, payload);
        }
        return payload;
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
        var _this = _super.call(this, __assign({ messageTemplate: {
                type: 'metricType',
                environment: '$environment',
                'value?': 'metric.value',
            } }, options)) || this;
        _this.json = new JsonPostHandler(_this);
        return _this;
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
                        var callOptions, beforeResult, response, e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    callOptions = this.getCallOptions(options);
                                    return [4 /*yield*/, this.before({ metricType: metricType, metric: metric }, callOptions)];
                                case 1:
                                    beforeResult = _a.sent();
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, this.json.post({ metricType: beforeResult.metricType, metric: beforeResult.metric }, callOptions)];
                                case 3:
                                    response = _a.sent();
                                    resolve(response);
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_2 = _a.sent();
                                    this.debug('mindfulness metrics error', e_2);
                                    reject(e_2);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    JsonPostMetrics.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.options.debug) {
            (_a = console.info).call.apply(_a, [console].concat(args));
        }
        var _a;
    };
    /**
     * Used to create the list of arguments each metric function uses
     *
     * @param args Arguments array
     */
    JsonPostMetrics.prototype.settleArguments = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var m = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))();
        var options = this.options;
        // in cases where the first argument is a Metric object and the second one is an object,
        // we'll assume that it we're getting: (metric, options)
        if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
            options = args[1];
        }
        return {
            args: args,
            metric: m,
            options: options,
        };
    };
    JsonPostMetrics.prototype.increment = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a, callArgs, metric, options;
            return __generator(this, function (_b) {
                _a = this.settleArguments.apply(this, args), callArgs = _a.args, metric = _a.metric, options = _a.options;
                return [2 /*return*/, this.call('increment', metric, options)];
            });
        });
    };
    JsonPostMetrics.prototype.timing = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a, callArgs, metric, options;
            return __generator(this, function (_b) {
                _a = this.settleArguments.apply(this, args), callArgs = _a.args, metric = _a.metric, options = _a.options;
                return [2 /*return*/, this.call('timing', metric, options)];
            });
        });
    };
    return JsonPostMetrics;
}(contrib_metrics_1.default));
exports.JsonPostMetrics = JsonPostMetrics;
//# sourceMappingURL=json_post.js.map