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
const index_1 = require("../src/index");
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
test('Logger with console logs to console', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger(['console']);
    yield l.log('my message');
    expect(spies.log).toHaveBeenCalled();
    done();
}));
test('Logger with no arguments gets console layer', () => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger();
    expect(l.layers).toHaveLength(1);
    yield l.log('my message');
    expect(spies.log).toHaveBeenCalled();
}));
test('Logger with console layer gets correct layer', () => {
    const l = new index_1.Logger([{ type: 'console' }]);
    expect(l.layers).toHaveLength(1);
});
test('Logger with POST layer gets correct layer', () => {
    const l = new index_1.Logger([{
            type: 'json_post',
        }]);
    expect(l.layers).toHaveLength(1);
});
test('Logger with incorrect layer throws error', () => {
    const l = new index_1.Logger([{ type: 'fake_logger' }]);
});
test('Logger handles "before" callbacks', (done) => __awaiter(this, void 0, void 0, function* () {
    const before = function (message, payload) {
        return new Promise((resolve) => {
            const result = { payload, message: message + '!', options: this.options };
            resolve(result);
        });
    };
    const l = new index_1.Logger(['console'], { before });
    expect(l.options).toHaveProperty('before');
    yield l.log('hi');
    expect(spies.log).toHaveBeenCalled();
    expect(spies.log.mock.calls[0]).toContain('hi!');
    done();
}));
test('Logger handles a call-specific "before" callback', (done) => __awaiter(this, void 0, void 0, function* () {
    const before = function (message, payload) {
        return new Promise((resolve) => {
            const result = { payload, message: message + '!', options: this.options };
            resolve(result);
        });
    };
    // don't pass the "before" function here
    const l = new index_1.Logger(['console']);
    // but pass it on the call
    yield l.log('hi', null, { before });
    expect(spies.log).toHaveBeenCalled();
    expect(spies.log.mock.calls[0]).toContain('hi!');
    // logger options should not be changed by the before handler.
    expect(l.options).not.toHaveProperty('before');
    done();
}));
test('Logger handlers "after" callbacks', (done) => __awaiter(this, void 0, void 0, function* () {
    const after = function (message, payload) {
        console.log('after');
        return new Promise((resolve) => {
            const result = { payload, message: message + '!', options: this.options };
            resolve(result);
        });
    };
    const l = new index_1.Logger(['console'], { after });
    const spy = jest.spyOn(l.options, 'after');
    expect(l.options).toHaveProperty('after');
    yield l.log('hi');
    expect(spies.log).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    done();
}));
//# sourceMappingURL=logger.js.map