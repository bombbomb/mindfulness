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
const logging_1 = require("../util/logging");
/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
class JsonPostLogger {
    constructor(parent, options) {
        this.parent = parent;
        this.options = Object.assign({ logLevel: logger_1.LOG_LEVELS.LOG_ALL }, options);
    }
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
     * Get the options for a specific call.
     *
     * Basically will return an options object for a specific call merged with the logger's
     * default options.
     *
     * @param options Call specific options
     */
    getCallOptions(options) {
        return (options) ? Object.assign({}, this.options, options) : this.options;
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
            type: level,
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
    log(message, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('log', message, payload);
        });
    }
    logError(message, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('error', message, payload);
        });
    }
    logInfo(message, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('info', message, payload);
        });
    }
    logWarn(message, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('warn', message, payload);
        });
    }
}
exports.JsonPostLogger = JsonPostLogger;
//# sourceMappingURL=json_post.js.map