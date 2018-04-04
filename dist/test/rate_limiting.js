"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var rate_limiter_1 = require("../src/contrib/rate_limiter");
var index_1 = require("../src/index");
var logSpy = jest.spyOn(console, 'log');
beforeEach(function () {
    logSpy.mockReset();
});
test('rate limit is not triggered by default', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        expect(r.allowed({ message: 'test' })).toBe(true);
        expect(Object.keys(r.messages)).toHaveLength(1);
        done();
        return [2 /*return*/];
    });
}); });
test('rate limit honors message threshold', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r, options;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        options = { rateLimitMessageThreshold: 1 };
        expect(r.allowed({ message: 'test' }, options)).toBe(true);
        expect(r.allowed({ message: 'test' }, options)).toBe(false);
        expect(Object.keys(r.messages)).toHaveLength(1);
        done();
        return [2 /*return*/];
    });
}); });
test('rate limit will allow messages when the old messages have expired', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r, options;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        options = { rateLimitExpiration: 10, rateLimitMessageThreshold: 1 };
        expect(r.allowed({ message: 'test' }, options)).toBe(true);
        // so messages should expire after 10ms, so calling a new message after 20ms
        // should not trip rate limiting
        setTimeout(function () {
            expect(r.allowed({ message: 'test' }, options)).toBe(true);
            expect(Object.keys(r.messages)).toHaveLength(1);
            done();
        }, 20);
        return [2 /*return*/];
    });
}); });
test('rate limit honors message key as separate messages', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r, options;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        options = { rateLimitKey: 'message' };
        expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
        expect(r.allowed({ message: 'test 2' }, options)).toBe(true);
        expect(Object.keys(r.messages)).toHaveLength(2);
        done();
        return [2 /*return*/];
    });
}); });
test('rate limit blocks repeat messages with specific key', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r, options;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        options = { rateLimitMessageThreshold: 1, rateLimitKey: 'message' };
        expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
        expect(r.allowed({ message: 'test 2' }, options)).toBe(true);
        expect(r.allowed({ message: 'test 2' }, options)).toBe(false);
        expect(Object.keys(r.messages)).toHaveLength(2);
        done();
        return [2 /*return*/];
    });
}); });
test('rate limit garbage collection does not remove fresh messages', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r, options;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        options = { rateLimitKey: 'message' };
        expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
        expect(r.allowed({ message: 'test 2' }, options)).toBe(true);
        r.collectGarbage(options, true);
        expect(Object.keys(r.messages)).toHaveLength(2);
        done();
        return [2 /*return*/];
    });
}); });
test('rate limit garbage collection removes stale messages', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var r, options;
    return __generator(this, function (_a) {
        r = new rate_limiter_1.default();
        options = { rateLimitKey: 'message', rateLimitStaleTime: 10 };
        expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
        expect(r.allowed({ message: 'test 2' }, options)).toBe(true);
        setTimeout(function () {
            r.collectGarbage(options, true);
            expect(Object.keys(r.messages)).toHaveLength(0);
            done();
        }, 20);
        return [2 /*return*/];
    });
}); });
test('rate limit log messages', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger(['console'], {
                    rateLimit: true,
                    rateLimitMessageThreshold: 1,
                });
                return [4 /*yield*/, l.log('message')];
            case 1:
                _a.sent();
                return [4 /*yield*/, l.log('message')];
            case 2:
                _a.sent();
                expect(logSpy).toHaveBeenCalledTimes(1);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('rate limit log messages with a filter', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger(['console'], {
                    rateLimit: true,
                    rateLimitMessageThreshold: 1,
                    rateLimitFilter: function (details) {
                        if (details.message === 'message') {
                            return true;
                        }
                        return false;
                    },
                });
                return [4 /*yield*/, l.log('message')];
            case 1:
                _a.sent();
                return [4 /*yield*/, l.log('message')];
            case 2:
                _a.sent();
                return [4 /*yield*/, l.log('message2')];
            case 3:
                _a.sent();
                expect(logSpy).toHaveBeenCalledTimes(2);
                done();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=rate_limiting.js.map