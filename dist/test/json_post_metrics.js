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
var metric_1 = require("../src/models/metric");
afterEach(function () {
    nock_1.default.cleanAll();
});
test('JsonPostMetrics.getRequestOptions returns object', function () {
    var m = new index_1.Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
    var jsonMetrics = m.layers[0];
    var obj = { headers: { 'X-Thing': 123 } };
    var result = jsonMetrics.getRequestOptions(obj, 'increment', new metric_1.default('myMetric'), jsonMetrics.options);
    expect(result)
        .toMatchObject(__assign({}, obj, { method: 'POST', uri: 'http://metrics.example.com/', body: {
            environment: 'test',
        } }));
});
test('send metrics via post request to example.com', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, metricsEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    { type: 'json_post', host: 'metrics.example.com' }
                ]);
                metricsEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/', {
                    environment: 'test',
                    type: 'increment',
                })
                    .reply(200, {});
                return [4 /*yield*/, m.increment('myMetric')];
            case 1:
                _a.sent();
                expect(metricsEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('send metrics via post request to example.com with scheme in host', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, metricsEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    { type: 'json_post', host: 'http://metrics.example.com' }
                ]);
                metricsEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/', {
                    environment: 'test',
                    type: 'increment',
                })
                    .reply(200, {});
                return [4 /*yield*/, m.increment('myMetric')];
            case 1:
                _a.sent();
                expect(metricsEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Can modify the request body with requestBodyCallback', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, metricsEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    {
                        type: 'json_post',
                        host: 'metrics.example.com',
                        requestBodyCallback: function (body, details) {
                            var newBody = __assign({}, body, { newElement: 123 });
                            return newBody;
                        },
                    },
                ]);
                metricsEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/', {
                    environment: 'test',
                    type: 'increment',
                    newElement: 123,
                })
                    .reply(200, {});
                return [4 /*yield*/, m.increment('myMetric')];
            case 1:
                _a.sent();
                expect(metricsEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Increment requests to a different URL', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, incorrectEndpoint, correctEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    {
                        type: 'json_post',
                        host: 'metrics.example.com',
                        paths: {
                            increment: '/increment',
                        },
                    },
                ]);
                incorrectEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/')
                    .reply(200, {});
                correctEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/increment', {
                    environment: 'test',
                    type: 'increment',
                    value: 10,
                })
                    .reply(200, {});
                return [4 /*yield*/, m.increment('myMetric', 10)];
            case 1:
                _a.sent();
                expect(incorrectEndpoint.isDone()).toBe(false);
                expect(correctEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Include metric value in the request URL', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, correctEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    {
                        type: 'json_post',
                        host: 'metrics.example.com',
                        paths: {
                            increment: '/path/$category/$metric',
                        },
                    },
                ]);
                correctEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/path/myMetric', {
                    environment: 'test',
                    type: 'increment',
                    value: 10,
                })
                    .reply(200, {});
                return [4 /*yield*/, m.increment('myMetric', 10)];
            case 1:
                _a.sent();
                expect(correctEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Include metric and category value in the request URL', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, correctEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    {
                        type: 'json_post',
                        host: 'metrics.example.com',
                        paths: {
                            increment: '/path/$category/$metric',
                        },
                    },
                ]);
                correctEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/path/awesome/myMetric', {
                    environment: 'test',
                    type: 'increment',
                    value: 10,
                })
                    .reply(200, {});
                return [4 /*yield*/, m.increment('awesome', 'myMetric', 10)];
            case 1:
                _a.sent();
                expect(correctEndpoint.isDone()).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metric post failure should throw an error', function (done) { return __awaiter(_this, void 0, void 0, function () {
    var m, correctEndpoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics([
                    {
                        type: 'json_post',
                        host: 'metrics.example.com',
                        paths: {
                            increment: '/path/$category/$metric',
                        },
                    },
                ]);
                correctEndpoint = nock_1.default('http://metrics.example.com')
                    .post('/path/awesome/myMetric', {
                    environment: 'test',
                    type: 'increment',
                    value: 10,
                })
                    .reply(500, {});
                return [4 /*yield*/, expect(m.increment('awesome', 'myMetric', 10))
                        .rejects.toThrowError()];
            case 1:
                _a.sent();
                done();
                return [2 /*return*/];
        }
    });
}); });
describe('Metric silent()', function () {
    test('stops errors from propegating', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var m, correctEndpoint;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    m = new index_1.Metrics([
                        {
                            type: 'json_post',
                            host: 'metrics.example.com',
                            paths: {
                                increment: '/path/$category/$metric',
                            },
                        },
                    ]);
                    correctEndpoint = nock_1.default('http://metrics.example.com')
                        .post('/path/awesome/myMetric', {
                        environment: 'test',
                        type: 'increment',
                        value: 10,
                    })
                        .reply(500, {});
                    return [4 /*yield*/, expect(m.silent().increment('awesome', 'myMetric', 10))
                            .resolves.not.toThrowError()];
                case 1:
                    _a.sent();
                    // errors are still captured in the object...
                    expect(m.errors).toHaveLength(1);
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    test('only stops one error from propegating', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var m, correctEndpoint;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    m = new index_1.Metrics([
                        {
                            type: 'json_post',
                            host: 'metrics.example.com',
                            paths: {
                                increment: '/path/$category/$metric',
                            },
                        },
                    ]);
                    correctEndpoint = nock_1.default('http://metrics.example.com')
                        .post('/path/awesome/myMetric', {
                        environment: 'test',
                        type: 'increment',
                        value: 10,
                    })
                        .reply(500, {});
                    return [4 /*yield*/, expect(m.silent().increment('awesome', 'myMetric', 10))
                            .resolves.not.toThrowError()];
                case 1:
                    _a.sent();
                    expect(m.options.silent).toBe(false);
                    return [4 /*yield*/, expect(m.increment('awesome', 'myMetric', 10))
                            .rejects.toThrowError()];
                case 2:
                    _a.sent();
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    test('does not stop successful calls', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var m, correctEndpoint;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    m = new index_1.Metrics([
                        {
                            type: 'json_post',
                            host: 'metrics.example.com',
                            paths: {
                                increment: '/path/$category/$metric',
                            },
                        },
                    ]);
                    correctEndpoint = nock_1.default('http://metrics.example.com')
                        .post('/path/awesome/myMetric', {
                        environment: 'test',
                        type: 'increment',
                        value: 10,
                    })
                        .reply(200, {});
                    return [4 /*yield*/, expect(m.silent().increment('awesome', 'myMetric', 10))
                            .resolves.not.toThrowError()];
                case 1:
                    _a.sent();
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=json_post_metrics.js.map