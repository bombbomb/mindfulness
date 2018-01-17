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
                const callOptions = (options) ? options : this.options;
                if (callOptions.logLevel != logger_1.LOG_LEVELS.LOG_NONE && callOptions.logLevel & logging_1.getLogLevelConstant(level)) {
                    const requestOptions = {
                        method: 'POST',
                        uri: this.getRequestUri(),
                        body: {
                            message,
                            info: (payload) ? payload : {},
                            severity: level,
                            type: level,
                        },
                        json: true
                    };
                    console.log(requestOptions);
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
    getRequestUri() {
        let url = '';
        const scheme = (this.options.scheme) ? this.options.scheme : 'http';
        const host = (this.options.host) ? String(this.options.host) : 'localhost';
        const port = (this.options.port) ? Number(this.options.port) : null;
        const path = (this.options.path) ? String(this.options.path) : '/';
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