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
const console_1 = require("../src/contrib/console");
const logger_1 = require("../src/interfaces/logger");
const spies = {
    log: jest.spyOn(global.console, 'log'),
    info: jest.spyOn(global.console, 'info'),
    error: jest.spyOn(global.console, 'error'),
    warn: jest.spyOn(global.console, 'warn'),
};
afterEach(() => {
    Object.keys(spies).forEach((spy) => {
        spies[spy].mockReset();
    });
});
afterAll(() => {
    Object.keys(spies).forEach((spy) => {
        spies[spy].mockReset();
        spies[spy].mockRestore();
    });
});
test('ConsoleLogger.getLogLevelConstant', () => {
    const l = new console_1.ConsoleLogger(null);
    expect(l.getLogLevelConstant('log')).toBe(logger_1.LOG_LEVELS.LOG_LOG);
    expect(l.getLogLevelConstant('info')).toBe(logger_1.LOG_LEVELS.LOG_INFO);
});
test('ConsoleLogger logs to the console', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new console_1.ConsoleLogger(null);
    const message = 'my message';
    yield l.log(message);
    expect(spies.log).toHaveBeenCalled();
    expect(spies.log.mock.calls[0]).toContain(message);
    done();
}));
test('ConsoleLogger logInfo sends info log', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new console_1.ConsoleLogger(null);
    const message = 'info message';
    yield l.logInfo(message);
    expect(spies.info).toHaveBeenCalled();
    expect(spies.info.mock.calls[0]).toContain(message);
    expect(spies.log).toHaveBeenCalledTimes(0);
    done();
}));
test('ConsoleLogger logWarn sends warn log', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new console_1.ConsoleLogger(null);
    const message = 'warn message';
    yield l.logWarn(message);
    expect(spies.warn).toHaveBeenCalled();
    expect(spies.warn.mock.calls[0]).toContain(message);
    expect(spies.log).toHaveBeenCalledTimes(0);
    done();
}));
test('ConsoleLogger logError sends error log', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new console_1.ConsoleLogger(null);
    const message = 'error message';
    yield l.logError(message);
    expect(spies.error).toHaveBeenCalled();
    expect(spies.error.mock.calls[0]).toContain(message);
    expect(spies.log).toHaveBeenCalledTimes(0);
    done();
}));
test('ConsoleLogger honors log level', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new console_1.ConsoleLogger(null, { logLevel: logger_1.LOG_LEVELS.LOG_NONE });
    yield l.log('message');
    expect(spies.log).toHaveBeenCalledTimes(0);
    l.options.logLevel = logger_1.LOG_LEVELS.LOG_LOG;
    yield l.log('message');
    expect(spies.log).toHaveBeenCalledTimes(1);
    done();
}));
//# sourceMappingURL=console_logger.js.map