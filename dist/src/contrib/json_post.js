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
const request_promise_native_1 = require("request-promise-native");
const logger_1 = require("../interfaces/logger");
const contrib_logger_1 = require("./contrib_logger");
const contrib_metrics_1 = require("./contrib_metrics");
const logging_1 = require("../util/logging");
const metric_1 = require("../models/metric");
/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
class JsonPostLogger extends contrib_logger_1.default {
    /**
     * Send the POST request.
     *
     * @param level Log level as a lowercase string
     * @param message The log message
     * @param payload The payload to include
     * @param options Call-specific options
     */
    call(level, message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const callOptions = this.getCallOptions(options);
                if (callOptions.logLevel != logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.getLogLevelConstant(level)) {
                    try {
                        if (typeof message !== 'string') {
                            message = JSON.stringify(message);
                        }
                        if (payload && payload instanceof Error) {
                            payload = {
                                message: payload.message,
                                stack: payload.stack
                            };
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                    const requestOptions = {
                        body: this.getRequestBody(level, message, payload, options),
                        method: 'POST',
                        uri: this.getRequestUri(options),
                        json: true
                    };
                    try {
                        const response = yield request_promise_native_1.default(requestOptions);
                        resolve(response);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
                else {
                    resolve();
                }
            }));
        });
    }
    /**
     * Build the request body and hand off to a requestHandler if specified.
     *
     * @param level Log level string
     * @param message Message being logged
     * @param payload Current payload
     * @param options Call-specific options
     */
    getRequestBody(level, message, payload, options) {
        let body = {
            message,
            info: (payload) ? payload : {},
            severity: level,
            type: level
        };
        const callOptions = this.getCallOptions(options);
        if (callOptions.requestHandler) {
            body = callOptions.requestHandler(body, { level, message, payload, callOptions });
        }
        return body;
    }
    /**
     * Get the request URI based on options.
     */
    getRequestUri(options) {
        const callOptions = this.getCallOptions(options);
        let url = '';
        const scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
        const host = (callOptions.host) ? String(callOptions.host) : 'localhost';
        const port = (callOptions.port) ? Number(callOptions.port) : null;
        const path = (callOptions.path) ? String(callOptions.path) : '/';
        url = scheme + '://' + host;
        if (port) {
            url += ':' + port;
        }
        url += path;
        return url;
    }
}
exports.JsonPostLogger = JsonPostLogger;
/**
 * JSON POST metrics
 *
 * Passes off a metrics request to a remote endpoint.
 */
class JsonPostMetrics extends contrib_metrics_1.default {
    /**
     * Send the POST request.
     *
     * @param metricType The metric update being made (increment, decrement, timing)
     * @param metric The metric being updated
     * @param options Call-specific options
     */
    call(metricType, metric, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const callOptions = this.getCallOptions(options);
                const requestOptions = this.getRequestOptions({
                    json: true
                }, metricType, metric, callOptions);
                try {
                    const response = yield request_promise_native_1.default(requestOptions);
                    resolve(response);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    decrement(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const m = new metric_1.default(...args);
            let options = this.options;
            if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                options = args[1];
            }
            return this.call('decrement', new metric_1.default(...args), options);
        });
    }
    increment(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const m = new metric_1.default(...args);
            let options = this.options;
            if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                options = args[1];
            }
            return this.call('increment', new metric_1.default(...args), options);
        });
    }
    timing(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const m = new metric_1.default(...args);
            let options = this.options;
            if (args.length === 2 && args[0] instanceof metric_1.default && typeof args[1] === 'object') {
                options = args[1];
            }
            return this.call('timing', new metric_1.default(...args), options);
        });
    }
    /**
     * Get the environment to pass in the body.
     */
    getEnvironment() {
        if (process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        else if (process.env.ENVIRONMENT) {
            return process.env.ENVIRONMENT;
        }
        return 'production';
    }
    /**
     * Build the request body and hand off to a requestHandler if specified.
     *
     * @param metricType The type of call being made
     * @param metric The metric object being sent
     * @param options Call-specific options
     */
    getRequestBody(metricType, metric, options) {
        const callOptions = this.getCallOptions(options);
        const dataDefaults = (callOptions.dataDefaults) ? callOptions.dataDefaults : {};
        let body = Object.assign({ environment: this.getEnvironment(), type: metricType }, dataDefaults);
        if (metric.value) {
            body.value = metric.value;
        }
        if (callOptions.requestBodyCallback) {
            body = callOptions.requestBodyCallback(body, { metricType, metric, callOptions });
        }
        return body;
    }
    /**
     * Get the request() options.
     *
     * @param request The current request() options
     * @param metricType The metric type being called
     * @param metric The metric being updated
     * @param options Call-specific options.
     */
    getRequestOptions(request, metricType, metric, options) {
        if (options.requestOptionsCallback) {
            const result = options.requestOptionsCallback(request, metricType, metric, options);
            if (result && typeof result === 'object') {
                request = result;
            }
            else {
                console.warn('The results of Metrics.requestOptionsCallback did not return a correct value. Ignoring result with type: ' + typeof result);
            }
        }
        let thisRequest = Object.assign({}, request, { method: 'POST', uri: this.getRequestUri(metricType, metric, options), body: this.getRequestBody(metricType, metric, options) });
        if (typeof thisRequest.body === 'object') {
            thisRequest.json = true;
        }
        return thisRequest;
    }
    /**
     * Get the request path.
     *
     * @param metricType The metric type being sent
     * @param options An object of options for this call.
     */
    getRequestPath(metricType, options) {
        if (options.hasOwnProperty('paths') && options.paths.hasOwnProperty(metricType)) {
            return options.paths[metricType];
        }
        return (options.path) ? String(options.path) : '/';
    }
    /**
     * Get the request URI based on options.
     */
    getRequestUri(metricType, metric, options) {
        const callOptions = this.getCallOptions(options);
        let url = '';
        const scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
        const host = (callOptions.host) ? String(callOptions.host) : 'localhost';
        const port = (callOptions.port) ? Number(callOptions.port) : null;
        url = scheme + '://' + host;
        if (port) {
            url += ':' + port;
        }
        url += this.getRequestPath(metricType, callOptions);
        const category = (metric.category) ? metric.category + '$1' : '';
        url = url.replace(/\$category(\/)?/, category);
        url = url.replace(/\$metric(\/)?/, metric.metric + '$1');
        return url;
    }
}
exports.JsonPostMetrics = JsonPostMetrics;
//# sourceMappingURL=json_post.js.map