"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RATE_LIMIT_GC = 6;
var RATE_LIMIT_STALE = 60 * 1000;
var RATE_LIMIT_TIMEOUT = 2 * 60 * 1000;
var RATE_LIMIT_MESSAGE_THRESHOLD = 50;
var RateLimiter = /** @class */ (function () {
    function RateLimiter() {
        this.messages = {};
    }
    RateLimiter.prototype.getMessageKey = function (details, options) {
        var key = '__all__';
        if (options.rateLimitKey) {
            key = details[options.rateLimitKey];
        }
        if (options.rateLimitKeyCallback) {
            key = options.rateLimitKeyCallback(key, details);
        }
        return key;
    };
    RateLimiter.prototype.allowed = function (details, options) {
        if (options === void 0) { options = {}; }
        var key = this.getMessageKey(details, options);
        this.collectGarbage(options);
        // if there is a filter, apply it and if we are not rate limiting this message,
        // pass it through like normal...
        if (options.rateLimitFilter && !options.rateLimitFilter(details, options)) {
            return true;
        }
        // new entry
        if (!this.messages[key]) {
            this.messages[key] = {
                ts: (new Date()).getTime(),
                count: 1,
            };
            return true;
        }
        // message exists, so we should check if it should be sent...
        var rateExpiration = options.rateLimitExpiration || RATE_LIMIT_STALE;
        var messageThreshold = options.rateLimitMessageThreshold || RATE_LIMIT_MESSAGE_THRESHOLD;
        var expiration = Date.now() - rateExpiration;
        // if the last timestamp for this message is past the expiration, then
        // we can send this message and reset this entry...
        if (this.messages[key].ts < expiration) {
            this.messages[key].ts = Date.now();
            this.messages[key].count = 1;
            return true;
        }
        else if (this.messages[key].count < messageThreshold) {
            this.messages[key].ts = Date.now();
            this.messages[key].count += 1;
            return true;
        }
        return false;
    };
    /**
     * Trim old messages from our rate tracking.
     *
     * @param options Any options
     * @param force Force GC (normally there is a strong chance that GC will occur, occasionally it will not)
     */
    RateLimiter.prototype.collectGarbage = function (options, force) {
        if (force === void 0) { force = false; }
        // 60% chance of GC
        var collect = this.getRandomInt(0, 10) <= RATE_LIMIT_GC;
        if (!collect && !force) {
            return;
        }
        var stale = options.rateLimitStaleTime || RATE_LIMIT_STALE;
        var staleTime = Date.now() - stale;
        var keys = Object.keys(this.messages);
        var newRates = {};
        for (var i = 0; i < keys.length; i += 1) {
            if (this.messages[keys[i]].ts >= staleTime) {
                newRates[keys[i]] = this.messages[keys[i]];
            }
        }
        this.messages = newRates;
    };
    RateLimiter.prototype.getRandomInt = function (min, max) {
        var randomMin = Math.ceil(min);
        var randomMax = Math.floor(max);
        return Math.floor(Math.random() * (randomMax - randomMin)) + randomMin;
    };
    return RateLimiter;
}());
exports.default = RateLimiter;
//# sourceMappingURL=rate_limiter.js.map