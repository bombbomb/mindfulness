"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var nock_1 = require("nock");
var jest_mock_console_1 = require("jest-mock-console");
var index_1 = require("../src/index");
beforeEach(function () {
    nock_1.default.cleanAll();
});
afterEach(function () {
    nock_1.default.cleanAll();
});
test('log via post request to example.com', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com' },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', {
                    severity: 'log',
                    type: 'log',
                    message: 'Hello!',
                    info: {},
                    environment: 'test',
                })
                    .reply(200, {});
                return [4 /*yield*/, l.log('Hello!')];
            case 1:
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('log via post payload request to example.com', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com' },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', {
                    severity: 'log',
                    type: 'log',
                    message: 'Hello!',
                    info: { example: 123 },
                    environment: 'test',
                })
                    .reply(200, {});
                return [4 /*yield*/, l.log('Hello!', { example: 123 })];
            case 1:
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('log object for message', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com' },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', function (req) {
                    expect(req).toEqual({
                        severity: 'log',
                        type: 'log',
                        message: '{"example":123}',
                        info: {},
                        environment: 'test',
                    });
                    return true;
                })
                    .reply(200, {});
                return [4 /*yield*/, l.log({ example: 123 })];
            case 1:
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('log error for payload', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint, unmute;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com' },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', function (req) {
                    expect(req).toMatchObject({
                        severity: 'log',
                        type: 'log',
                        message: 'Error doing things',
                        info: {
                            message: 'You did everything wrong',
                            stack: expect.any(String),
                        },
                    });
                    return true;
                })
                    .reply(200, {});
                unmute = jest_mock_console_1.default();
                return [4 /*yield*/, l.log('Error doing things', new Error('You did everything wrong'))];
            case 1:
                _a.sent();
                unmute();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('can debug', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint, c;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com', debug: true },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', {
                    severity: 'log',
                    type: 'log',
                    message: 'Hello!',
                    info: { example: 123 },
                    environment: 'test',
                })
                    .reply(200, {});
                c = __assign({}, console);
                console.info = jest.fn();
                return [4 /*yield*/, l.log('Hello!', { example: 123 })];
            case 1:
                _a.sent();
                expect(console.info).toHaveBeenCalled();
                expect(loggingEndpoint.isDone()).toBe(true);
                console = c;
                done();
                return [2 /*return*/];
        }
    });
}); });
test('can change request body', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint, unmute;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    {
                        type: 'json_post',
                        host: 'logging.example.com',
                        requestBodyCallback: function (body, details) { return (__assign({}, body, { injected: 123 })); },
                    },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', function (req) {
                    expect(req).toMatchObject({
                        severity: 'log',
                        type: 'log',
                        message: 'Error doing things',
                        injected: 123,
                        info: {
                            payload: 234,
                        },
                    });
                    return true;
                })
                    .reply(200, {});
                unmute = jest_mock_console_1.default();
                return [4 /*yield*/, l.log('Error doing things', { payload: 234 })];
            case 1:
                _a.sent();
                unmute();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('can include data defaults', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    {
                        type: 'json_post',
                        host: 'logging.example.com',
                        dataDefaults: { xsrc: 'example' },
                    },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', function (req) {
                    expect(req).toMatchObject({
                        severity: 'log',
                        type: 'log',
                        message: 'Error doing things',
                        xsrc: 'example',
                        environment: 'test',
                        info: {
                            payload: 234,
                        },
                    });
                    return true;
                })
                    .reply(200, {});
                return [4 /*yield*/, l.log('Error doing things', { payload: 234 })];
            case 1:
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('can change request body on a call', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint, unmute;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    {
                        type: 'json_post',
                        host: 'logging.example.com',
                    },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', function (req) {
                    expect(req).toMatchObject({
                        severity: 'log',
                        type: 'log',
                        message: 'Error doing things',
                        injected: 123,
                        environment: 'test',
                        info: {
                            payload: 234,
                        },
                    });
                    return true;
                })
                    .reply(200, {});
                unmute = jest_mock_console_1.default();
                return [4 /*yield*/, l.log('Error doing things', { payload: 234 }, {
                        requestBodyCallback: function (body, details) { return (__assign({}, body, { injected: 123 })); },
                    })];
            case 1:
                _a.sent();
                unmute();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('log fails on post error', function () { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint, unmute, r, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com' },
                ], { alwaysSilent: false, debug: true });
                loggingEndpoint = nock_1.default(/example/)
                    .post('/', function (body) { return true; })
                    .reply(500, {});
                unmute = jest_mock_console_1.default();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, l.log('test')];
            case 2:
                r = _a.sent();
                expect(true).toBe(false);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                expect(err_1).toBeDefined();
                return [3 /*break*/, 4];
            case 4:
                unmute();
                return [2 /*return*/];
        }
    });
}); });
test('$level variables is processed in the url', function () { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com', path: '/$level' },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/log', function () { return true; })
                    .reply(200, {});
                return [4 /*yield*/, l.log('Hello!')];
            case 1:
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                return [2 /*return*/];
        }
    });
}); });
test('logging does not fail when the host includes the scheme', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'http://logging.example.com' },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', {
                    severity: 'log',
                    type: 'log',
                    message: 'Hello!',
                    info: {},
                    environment: 'test',
                })
                    .reply(200, {});
                return [4 /*yield*/, l.log('Hello!')];
            case 1:
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
describe('log silent()', function () {
    test('stops an error from propegating', function () { return __awaiter(_this, void 0, void 0, function () {
        var l, loggingEndpoint, unmute;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    l = new index_1.Logger([
                        { type: 'json_post', host: 'logging.example.com' },
                    ], { alwaysSilent: false });
                    loggingEndpoint = nock_1.default('http://logging.example.com')
                        .post('/', function (body) { return true; })
                        .reply(500, {});
                    unmute = jest_mock_console_1.default();
                    return [4 /*yield*/, expect(l.silent().log('Hello!')).resolves.toMatchObject({ message: '500 - {}' })];
                case 1:
                    _a.sent();
                    unmute();
                    return [2 /*return*/];
            }
        });
    }); });
});
test('getRequestUri() handles trailing slash in host', function () {
    var l = new index_1.Logger([
        { type: 'json_post', host: 'http://logging.example.com/' },
    ]);
    expect(l.layers[0].json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: '/test' }))
        .toBe('http://logging.example.com/test');
});
test('getRequestUri() handles scheme from host slash in host', function () {
    var l = new index_1.Logger([
        { type: 'json_post', host: 'https://logging.example.com/' },
    ]);
    expect(l.layers[0].json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: '/test' })).toBe('https://logging.example.com/test');
});
test('getRequestUri() handles missing leading slash in path', function () {
    var l = new index_1.Logger([
        { type: 'json_post', host: 'http://logging.example.com' },
    ]);
    expect(l.layers[0].json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: 'test' })).toBe('http://logging.example.com/test');
});
test('json post honors log levels', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var l, loggingEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                l = new index_1.Logger([
                    { type: 'json_post', host: 'logging.example.com', logLevel: index_1.Logger.LOG_LEVELS.LOG_LOG },
                ]);
                loggingEndpoint = nock_1.default('http://logging.example.com')
                    .post('/', {
                    severity: 'log',
                    type: 'log',
                    message: 'Hello!',
                    info: {},
                    environment: 'test',
                })
                    .reply(200, {});
                return [4 /*yield*/, l.log('Hello!')];
            case 1:
                _a.sent();
                // this should get ignored, will throw a nock error if it doesn't...
                return [4 /*yield*/, l.logInfo('Info!')];
            case 2:
                // this should get ignored, will throw a nock error if it doesn't...
                _a.sent();
                expect(loggingEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=json_post_logger.js.map