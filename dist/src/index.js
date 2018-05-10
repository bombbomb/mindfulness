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
var console_1 = require("./contrib/console");
var null_1 = require("./contrib/null");
var json_post_1 = require("./contrib/json_post");
var logger_1 = require("./interfaces/logger");
var metric_1 = require("./models/metric");
var contribLoggers = {
    console: console_1.ConsoleLogger,
    json_post: json_post_1.JsonPostLogger,
    null: null_1.NullLogger,
};
var contribMetrics = {
    console: console_1.ConsoleMetrics,
    json_post: json_post_1.JsonPostMetrics,
    null: null_1.NullMetrics,
};
/**
 * Base mindfulness class used for Logger and Metrics.
 */
var MindfulnessBase = /** @class */ (function () {
    function MindfulnessBase() {
        this.options = {};
        this.layers = [];
        this.errors = [];
    }
    /**
     * Make sure all layers are active.
     */
    MindfulnessBase.prototype.activateAllLayers = function () {
        for (var index = 0; index < this.layers.length; index += 1) {
            this.layers[index].active = true;
        }
        return this;
    };
    /**
     * Handle an "after" function.
     *
     * Runs after all layers have finished.
     *
     * @param results Results from all logging layers
     */
    MindfulnessBase.prototype.after = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!this.options.after) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.options.after.apply(this, results)];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    resolve();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Deactivate all layers.
     */
    MindfulnessBase.prototype.deactivateAllLayers = function () {
        for (var index = 0; index < this.layers.length; index += 1) {
            this.layers[index].active = false;
        }
        return this;
    };
    /**
     * Error handler.
     *
     * Handles general error behavior and will also handle calling
     * an onError handler if one is present.
     *
     * @param error Error
     */
    MindfulnessBase.prototype.errorHandler = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.error("Mindfulness error: " + error);
                                    this.errors.push(error);
                                    if (!this.options.alwaysSilent && !this.options.silent) {
                                        console.warn('reject');
                                        reject(error);
                                        return [2 /*return*/];
                                    }
                                    this.options.silent = false;
                                    if (!this.options.onError) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.options.onError.apply(this, error)];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    resolve(error);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Filter the active layers for one call.
     *
     * @param filter A string or a callback to filter with
     */
    MindfulnessBase.prototype.filterLayers = function (filter) {
        var callback = filter;
        if (typeof filter === 'string') {
            callback = function (layer) { return layer instanceof contribLoggers[filter]; };
        }
        this.layers = this.layers.map(function (layer) {
            var thisLayer = layer;
            if (typeof layer.active === 'boolean') {
                thisLayer.active = callback(layer);
            }
            return thisLayer;
        });
        return this;
    };
    /**
     * Get the options for a specific call.
     *
     * Basically will return an options object for a specific call merged with the logger's
     * default options.
     *
     * @param options Call specific options
     */
    MindfulnessBase.prototype.getCallOptions = function (options) {
        // if we have call options, override the defaults or just return the defaults.
        return (options) ? __assign({}, this.options, options) : __assign({}, this.options);
    };
    return MindfulnessBase;
}());
/**
 * Logger class.
 *
 * A logger instance may represent one or more layers of logging. Each
 * layer represents an output (console, POST request, file, etc).
 */
var Logger = /** @class */ (function (_super) {
    __extends(Logger, _super);
    /**
     * Build our logger object.
     *
     * @param layers The logging layers to include.
     */
    function Logger(layers, options) {
        if (layers === void 0) { layers = []; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = __assign({ alwaysSilent: true, silent: false }, options);
        // default for logging is just to use the console
        var callLayers = layers;
        if (layers.length === 0) {
            callLayers = ['console'];
        }
        // add any layers that may exist
        callLayers.forEach(function (layer) {
            var thisLayer = layer;
            // user passed in a string
            if (typeof layer === 'string') {
                if (Object.keys(contribLoggers).indexOf(layer) < 0) {
                    throw new Error("Could not find layer type: " + layer);
                }
                thisLayer = new contribLoggers[layer]();
            }
            // this is a LoggerLayer
            else if (typeof layer === 'object' && layer.type && Object.keys(contribLoggers).indexOf(layer.type) >= 0) {
                thisLayer = new contribLoggers[layer.type](layer);
            }
            if (typeof thisLayer === 'object') {
                thisLayer.active = true;
            }
            _this.layers.push(thisLayer);
        });
        return _this;
    }
    /**
     * Handle a "before" function.
     *
     * These functions can be used to modify for a specific request. Before functions
     *
     * @param message The message being logged
     * @param payload The payload being logged
     * @param options The settings for this call
     */
    Logger.prototype.before = function (message, payload, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var before;
            return __generator(this, function (_a) {
                before = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, (new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var callOptions, thisPayload, args, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            callOptions = this.getCallOptions(options);
                                            thisPayload = payload;
                                            if (!(callOptions && callOptions.before)) return [3 /*break*/, 2];
                                            args = [];
                                            switch (callOptions.before.length) {
                                                case 3:
                                                    args.push(message);
                                                    args.push(payload);
                                                    break;
                                                default:
                                                    args.push({ message: message, payload: payload });
                                            }
                                            args.push(callOptions);
                                            return [4 /*yield*/, callOptions.before.apply(this, args)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, resolve(__assign({}, result))];
                                        case 2: return [2 /*return*/, resolve({ message: message, payload: thisPayload, options: callOptions })];
                                    }
                                });
                            }); }))];
                    });
                }); };
                return [2 /*return*/, before()];
            });
        });
    };
    /**
     * Used to log messages.
     *
     * Dynamically bound to the various methods in the constructor.
     *
     * @param logLevel Log level to use for this message
     * @param message The message
     * @param payload optional payload object
     */
    Logger.prototype.call = function (logLevel, message, payload, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var beforeResult, newOptions, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.before(message, payload, options)];
                    case 1:
                        beforeResult = _a.sent();
                        newOptions = beforeResult.options;
                        delete newOptions.before;
                        promises = this.layers
                            .filter(function (layer) { return layer.active === true; })
                            .map(function (layer) { return layer[logLevel](beforeResult.message, beforeResult.payload, newOptions); });
                        // return a promise that will resolve when all layers are finished
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                Promise.all(promises)
                                    .then(function (results) {
                                    _this
                                        .activateAllLayers()
                                        .after(results)
                                        .then(resolve);
                                })
                                    .catch(function (err) {
                                    _this.activateAllLayers();
                                    reject(err);
                                });
                            })
                                .then(function () {
                                _this.options.silent = false;
                            })
                                .catch(this.errorHandler.bind(this))];
                }
            });
        });
    };
    /**
     * Log a message to the "log" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    Logger.prototype.log = function (message, payload, options) {
        return this.call('log', message, payload, options);
    };
    /**
     * Log a message to the "error" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    Logger.prototype.logError = function (message, payload, options) {
        return this.call('logError', message, payload, options);
    };
    /**
     * Log a message to the "info" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    Logger.prototype.logInfo = function (message, payload, options) {
        return this.call('logInfo', message, payload, options);
    };
    /**
     * Log a message to the "warn" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    Logger.prototype.logWarn = function (message, payload, options) {
        return this.call('logWarn', message, payload, options);
    };
    /**
     * Alias for logWarn
     */
    Logger.prototype.logWarning = function (message, payload, options) {
        return this.logWarn(message, payload, options);
    };
    Logger.prototype.silent = function () {
        this.options.silent = true;
        return this;
    };
    Logger.LOG_LEVELS = logger_1.LOG_LEVELS;
    return Logger;
}(MindfulnessBase));
exports.Logger = Logger;
/**
 * Metrics sending class
 *
 * Send metrics to a metrics server via console or JSON POST.
 */
var Metrics = /** @class */ (function (_super) {
    __extends(Metrics, _super);
    /**
     * Constructor.
     *
     * @param layers Metrics handler layers
     * @param options Options for this metrics object.
     */
    function Metrics(layers, options) {
        if (layers === void 0) { layers = []; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = __assign({ alwaysSilent: true, silent: false }, options);
        // default for metrics is just to use the console
        var callLayers = layers;
        if (layers.length === 0) {
            callLayers = ['console'];
        }
        // add any layers that may exist
        callLayers.forEach(function (layer) {
            // user passed in a string
            if (typeof layer === 'string') {
                if (Object.keys(contribMetrics).indexOf(layer) < 0) {
                    throw new Error("Could not find layer type: " + layer);
                }
                _this.layers.push(new contribMetrics[layer]());
                return;
            }
            // this is a MetricLayer
            if (layer.type && Object.keys(contribMetrics).indexOf(layer.type) >= 0) {
                _this.layers.push(new contribMetrics[layer.type](layer));
                return;
            }
            _this.layers.push(layer);
        });
        return _this;
    }
    /**
     * Process any before handlers.
     *
     * @param metricType The metric type being called
     * @param metric The Metric object
     * @param options Current options for this call.
     */
    Metrics.prototype.before = function (metricType, metric, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var before;
            return __generator(this, function (_a) {
                before = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, (new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!options.before) return [3 /*break*/, 2];
                                            return [4 /*yield*/, options.before.apply(this, [metricType, metric, options])];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, resolve({ metric: result.metric, options: result.options })];
                                        case 2: return [2 /*return*/, resolve({ metric: metric, options: options })];
                                    }
                                });
                            }); }))];
                    });
                }); };
                return [2 /*return*/, before()];
            });
        });
    };
    /**
     * Handle increment calls.
     *
     * This will handle the before & after functionality and pass this
     * on to each metric layer as needed.
     *
     * @param metricType The metric type being called
     * @param args Args
     */
    Metrics.prototype.call = function (metricType) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var length, options, metric, beforeResult, newOptions, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (['increment', 'timing'].indexOf(metricType) < 0) {
                            return [2 /*return*/, Promise.reject(new Error("Invalid metric type: " + metricType))];
                        }
                        length = args.length;
                        options = this.options;
                        if (length <= 0) {
                            throw new Error("Invalid arguments for " + metricType);
                        }
                        else if (length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                            options = __assign({}, this.options, args[1]);
                        }
                        metric = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(args)))();
                        // fail timing metrics without values
                        if (metricType === 'timing' && !metric.value) {
                            return [2 /*return*/, Promise.reject(new Error('No value specified for a timing metric'))];
                        }
                        return [4 /*yield*/, this.before(metricType, metric, options)];
                    case 1:
                        beforeResult = _a.sent();
                        newOptions = beforeResult.options;
                        delete newOptions.before;
                        promises = this.layers.map(function (layer) { return layer[metricType](metric, newOptions); });
                        // return a promise that will resolve when all layers are finished
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                Promise.all(promises)
                                    // call any after functions
                                    .then(_this.after.bind(_this))
                                    .then(resolve)
                                    .catch(reject);
                            })
                                .then(function () {
                                _this.options.silent = false;
                            })
                                .catch(this.errorHandler.bind(this))];
                }
            });
        });
    };
    Metrics.prototype.decrement = function () {
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
    Metrics.prototype.increment = function () {
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
    Metrics.prototype.timing = function () {
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
    Metrics.prototype.silent = function () {
        this.options.silent = true;
        return this;
    };
    return Metrics;
}(MindfulnessBase));
exports.Metrics = Metrics;
//# sourceMappingURL=index.js.map