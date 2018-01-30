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
var nock_1 = require("nock");
var index_1 = require("../src/index");
var json_post_1 = require("../src/contrib/json_post");
var spies = {
    log: jest.spyOn(global.console, 'log'),
    info: jest.spyOn(global.console, 'info'),
    error: jest.spyOn(global.console, 'error'),
};
afterEach(function () {
    Object.keys(spies).forEach(function (spy) {
        spies[spy].mockReset();
    });
    nock_1.default.cleanAll();
});
afterAll(function () {
    Object.keys(spies).forEach(function (spy) {
        spies[spy].mockReset();
        spies[spy].mockRestore();
    });
});
test('Logger with console logs to console', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger(['console']);
                return [4 /*yield*/, l.log('my message')];
            case 1:
                _a.sent();
                expect(spies.log).toHaveBeenCalled();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger with no arguments gets console layer', function () { return __awaiter(_this, void 0, void 0, function () {
    var l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger();
                expect(l.layers).toHaveLength(1);
                return [4 /*yield*/, l.log('my message')];
            case 1:
                _a.sent();
                expect(spies.log).toHaveBeenCalled();
                return [2 /*return*/];
        }
    });
}); });
test('Logger with console layer gets correct layer', function () {
    var l = new index_1.Logger([{ type: 'console' }]);
    expect(l.layers).toHaveLength(1);
});
test('Logger with POST layer gets correct layer', function () {
    var l = new index_1.Logger([{
            type: 'json_post',
        }]);
    expect(l.layers).toHaveLength(1);
});
test('Logger with incorrect layer throws error', function () {
    var l = new index_1.Logger([{ type: 'fake_logger' }]);
});
test('Logger handles "before" callbacks', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var before, l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                before = function (message, payload) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var result = { payload: payload, message: message + "!", options: _this.options };
                        resolve(result);
                    });
                };
                l = new index_1.Logger(['console'], { before: before });
                expect(l.options).toHaveProperty('before');
                return [4 /*yield*/, l.log('hi')];
            case 1:
                _a.sent();
                expect(spies.log).toHaveBeenCalled();
                expect(spies.log.mock.calls[0]).toContain('hi!');
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger handles a call-specific "before" callback', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var before, l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                before = function (message, payload) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var result = { payload: payload, message: message + "!", options: _this.options };
                        resolve(result);
                    });
                };
                l = new index_1.Logger(['console']);
                // but pass it on the call
                return [4 /*yield*/, l.log('hi', null, { before: before })];
            case 1:
                // but pass it on the call
                _a.sent();
                expect(spies.log).toHaveBeenCalled();
                expect(spies.log.mock.calls[0]).toContain('hi!');
                // logger options should not be changed by the before handler.
                expect(l.options).not.toHaveProperty('before');
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger handlers "after" callbacks', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var after, l, spy;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                after = function (message, payload) {
                    var _this = this;
                    return new Promise(function (resolve) {
                        var result = { payload: payload, message: message + "!", options: _this.options };
                        resolve(result);
                    });
                };
                l = new index_1.Logger(['console'], { after: after });
                spy = jest.spyOn(l.options, 'after');
                expect(l.options).toHaveProperty('after');
                return [4 /*yield*/, l.log('hi')];
            case 1:
                _a.sent();
                expect(spies.log).toHaveBeenCalled();
                expect(spy).toHaveBeenCalled();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger alwaysSilent option stops all request errors', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var loggingEndpoint, l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .persist(true)
                    .post('/')
                    .reply(500, {});
                l = new index_1.Logger([{ type: 'json_post', host: 'http://logging.example.com' }], { alwaysSilent: true });
                return [4 /*yield*/, expect(l.log('Message 1')).resolves.not.toThrow()];
            case 1:
                _a.sent();
                return [4 /*yield*/, expect(l.log('Message 2')).resolves.not.toThrow()];
            case 2:
                _a.sent();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger without alwaysSilent fails on request errors', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var loggingEndpoint, l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .persist(true)
                    .post('/')
                    .reply(500, {});
                l = new index_1.Logger([{ type: 'json_post', host: 'http://logging.example.com' }], { alwaysSilent: false });
                return [4 /*yield*/, expect(l.log('Message 1')).rejects.toThrow()];
            case 1:
                _a.sent();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger filterLayers with string', function () {
    var l = new index_1.Logger(['console', { type: 'json_post' }]);
    expect(l.layers[0].active).toBe(true);
    expect(l.layers[1].active).toBe(true);
    l.filterLayers('console');
    expect(l.layers[0].active).toBe(true);
    expect(l.layers[1].active).toBe(false);
});
test('Logger filterLayers with callback', function () {
    var l = new index_1.Logger(['console', { type: 'json_post' }]);
    expect(l.layers[0].active).toBe(true);
    expect(l.layers[1].active).toBe(true);
    l.filterLayers(function (layer) { return layer instanceof json_post_1.JsonPostLogger; });
    expect(l.layers[0].active).toBe(false);
    expect(l.layers[1].active).toBe(true);
});
test('Logger calls can specify which layer to use for this call', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var loggingEndpoint, l;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/')
                    .reply(200, {});
                l = new index_1.Logger(['console', { type: 'json_post', host: 'http://logging.example.com' }]);
                return [4 /*yield*/, l.filterLayers('console').logError('Something went wrong')];
            case 1:
                _a.sent();
                expect(spies.error).toHaveBeenCalled();
                expect(loggingEndpoint.isDone()).toBe(false);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Logger calls can specify which layer to use for this call only', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var loggingEndpoint, l, index;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .persist()
                    .post('/')
                    .reply(200, {});
                l = new index_1.Logger(['console', { type: 'json_post', host: 'http://logging.example.com' }]);
                return [4 /*yield*/, l.filterLayers('console').logError('Something went wrong')];
            case 1:
                _a.sent();
                expect(spies.error).toHaveBeenCalled();
                expect(loggingEndpoint.isDone()).toBe(false);
                // all layers should be active...
                for (index = 0; index < l.layers.length; index += 1) {
                    expect(l.layers[index].active).toBe(true);
                }
                return [4 /*yield*/, l.log('Message')];
            case 2:
                _a.sent();
                expect(spies.log).toHaveBeenCalled();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=logger.js.map