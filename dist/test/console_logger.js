"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var console_1 = require("../src/contrib/console");
var logger_1 = require("../src/interfaces/logger");
var spies = {
    log: jest.spyOn(global.console, 'log'),
    info: jest.spyOn(global.console, 'info'),
    error: jest.spyOn(global.console, 'error'),
    warn: jest.spyOn(global.console, 'warn'),
};
afterEach(function () {
    Object.keys(spies).forEach(function (spy) {
        spies[spy].mockReset();
    });
});
afterAll(function () {
    Object.keys(spies).forEach(function (spy) {
        spies[spy].mockReset();
        spies[spy].mockRestore();
    });
});
test('ConsoleLogger logs to the console', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var l, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new console_1.ConsoleLogger();
                message = 'my message';
                return [4 /*yield*/, l.log(message)];
            case 1:
                _a.sent();
                expect(console.log).toHaveBeenCalled();
                // @ts-ignore
                expect(console.log.mock.calls[0]).toContain(message);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('ConsoleLogger logInfo sends info log', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var l, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new console_1.ConsoleLogger();
                message = 'info message';
                return [4 /*yield*/, l.logInfo(message)];
            case 1:
                _a.sent();
                expect(spies.info).toHaveBeenCalled();
                expect(spies.info.mock.calls[0]).toContain(message);
                expect(spies.log).toHaveBeenCalledTimes(0);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('ConsoleLogger logWarn sends warn log', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var l, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new console_1.ConsoleLogger();
                message = 'warn message';
                return [4 /*yield*/, l.logWarn(message)];
            case 1:
                _a.sent();
                expect(spies.warn).toHaveBeenCalled();
                expect(spies.warn.mock.calls[0]).toContain(message);
                expect(spies.log).toHaveBeenCalledTimes(0);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('ConsoleLogger logError sends error log', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var l, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new console_1.ConsoleLogger();
                message = 'error message';
                return [4 /*yield*/, l.logError(message)];
            case 1:
                _a.sent();
                expect(spies.error).toHaveBeenCalled();
                expect(spies.error.mock.calls[0]).toContain(message);
                expect(spies.log).toHaveBeenCalledTimes(0);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('ConsoleLogger honors log level', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new console_1.ConsoleLogger({ logLevel: logger_1.LOG_LEVELS.LOG_NONE });
                return [4 /*yield*/, l.log('message')];
            case 1:
                _a.sent();
                expect(spies.log).toHaveBeenCalledTimes(0);
                l.options.logLevel = logger_1.LOG_LEVELS.LOG_LOG;
                return [4 /*yield*/, l.log('message')];
            case 2:
                _a.sent();
                expect(spies.log).toHaveBeenCalledTimes(1);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('ConsoleLogger honors multiple log levels', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new console_1.ConsoleLogger({ logLevel: logger_1.LOG_LEVELS.LOG_LOG | logger_1.LOG_LEVELS.LOG_ERROR });
                return [4 /*yield*/, l.log('message')];
            case 1:
                _a.sent();
                return [4 /*yield*/, l.logError('message')];
            case 2:
                _a.sent();
                return [4 /*yield*/, l.logInfo('message')];
            case 3:
                _a.sent();
                expect(spies.log).toHaveBeenCalledTimes(1);
                expect(spies.error).toHaveBeenCalledTimes(1);
                expect(spies.info).toHaveBeenCalledTimes(0);
                done();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=console_logger.js.map