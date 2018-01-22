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
class ContribLogger {
    constructor(parent, options) {
        this.parent = parent;
        this.options = Object.assign({ logLevel: logger_1.LOG_LEVELS.LOG_ALL }, options);
    }
    call(level, message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                resolve();
            });
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
        // if we have call options, override the defaults or just return the defaults.
        return (options) ? Object.assign({}, this.options, options) : Object.assign({}, this.options);
    }
    /**
     * Log a message to console.log
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    log(message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('log', message, payload, options);
        });
    }
    /**
     * Log a message to console.error
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    logError(message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('error', message, payload, options);
        });
    }
    /**
     * Log a message to console.info
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    logInfo(message, payload, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('info', message, payload, options);
        });
    }
    /**
     * Log a message to console.warn
     * @param message Message or item to log
     * @param payload Additional payload to log
     * @param options Optional call-specific options
     */
    logWarn(message, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('warn', message, payload);
        });
    }
}
exports.default = ContribLogger;
//# sourceMappingURL=contrib_logger.js.map