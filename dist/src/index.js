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
const console_1 = require("./contrib/console");
const json_post_1 = require("./contrib/json_post");
const contrib = {
    console: console_1.ConsoleLogger,
    json_post: json_post_1.JsonPostLogger,
};
/**
 * Logger class.
 *
 * A logger instance may represent one or more layers of logging. Each
 * layer represents an output (console, POST request, file, etc).
 */
class Logger {
    /**
     * Build our logger object.
     *
     * @param layers The logging layers to include.
     */
    constructor(layers = [], options = {}) {
        this.layers = [];
        this.options = {};
        this.options = Object.assign({}, options);
        // default for logging is just to use the console
        if (layers.length == 0) {
            layers = ['console'];
        }
        // add any layers that may exist
        layers.forEach((layer) => {
            // user passed in a string
            if (typeof layer === 'string') {
                if (!contrib.hasOwnProperty(layer)) {
                    throw new Error('Could not find layer type: ' + layer);
                }
                this.layers.push(new contrib[layer](this));
                return;
            }
            // this is a LoggerLayer
            if (layer.type && contrib.hasOwnProperty(layer.type)) {
                this.layers.push(new contrib[layer.type](this, layer));
                return;
            }
            this.layers.push(layer);
        });
    }
    /**
     * Handle an "after" function.
     *
     * Runs after all layers have finished.
     *
     * @param results Results from all logging layers
     */
    after(results) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (this.options.after) {
                    yield this.options.after(results);
                }
                resolve();
            }));
        });
    }
    /**
     * Handle a "before" function.
     *
     * These functions can be used to modify for a specific request.
     *
     * @param message The message being logged
     * @param payload The payload being logged
     * @param options The settings for this call
     */
    before(message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const before = () => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    let callOptions = this.options;
                    if (options && Object.keys(options).length > 0) {
                        callOptions = options;
                    }
                    if (callOptions && callOptions.before) {
                        const result = yield callOptions.before(message, payload, callOptions);
                        [message, payload, callOptions] = [result.message, result.payload, result.options];
                    }
                    return resolve({ message, payload, options: callOptions });
                }));
            });
            return yield before();
        });
    }
    /**
     * Used to log messages.
     *
     * Dynamically bound to the various methods in the constructor.
     *
     * @param logLevel Log level to use for this message
     * @param message The message
     * @param payload optional payload object
     */
    call(logLevel, message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // call & wait for our before handlers
            const beforeResult = yield this.before(message, payload, options);
            // call the log function on each layer
            const promises = this.layers.map((layer) => layer[logLevel](beforeResult.message, beforeResult.payload, beforeResult.options));
            // return a promise that will resolve when all layers are finished
            return new Promise((resolve, reject) => {
                Promise.all(promises)
                    .then((results) => {
                    this.after(results)
                        .then(resolve);
                })
                    .catch(reject);
            });
        });
    }
    /**
     * Log a message to the "log" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    log(message, payload, options) {
        return this.call('log', message, payload, options);
    }
    /**
     * Log a message to the "error" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    logError(message, payload, options) {
        return this.call('logError', message, payload, options);
    }
    /**
     * Log a message to the "info" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    logInfo(message, payload, options) {
        return this.call('logInfo', message, payload, options);
    }
    /**
     * Log a message to the "warn" channel.
     *
     * @param message Message to log
     * @param payload Option payload to include
     */
    logWarn(message, payload, options) {
        return this.call('logWarn', message, payload, options);
    }
}
exports.Logger = Logger;
;
//# sourceMappingURL=index.js.map