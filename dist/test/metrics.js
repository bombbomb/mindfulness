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
var nock = require("nock");
var jest_mock_console_1 = require("jest-mock-console");
var index_1 = require("../src/index");
var spies = {
    // log: jest.spyOn(global.console, 'log'),
    info: jest.spyOn(global.console, 'info'),
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
test('Metrics with no layers defaults to console', function () {
    var m = new index_1.Metrics();
    expect(m.layers).toHaveLength(1);
});
test('Metrics works with null layer', function () {
    var m = new index_1.Metrics(['null']);
    expect(m.layers).toHaveLength(1);
});
test('Metrics works with type:null layer', function () {
    var m = new index_1.Metrics([{ type: 'null' }]);
    expect(m.layers).toHaveLength(1);
});
test('Metris.increment() sends metric', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics();
                return [4 /*yield*/, m.increment('metric')];
            case 1:
                _a.sent();
                expect(spies.info).toHaveBeenCalled();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metris.timing() sends metric', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics();
                return [4 /*yield*/, m.timing('metric', 100)];
            case 1:
                _a.sent();
                expect(spies.info).toHaveBeenCalled();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metrics.timing() fails with no value', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                m = new index_1.Metrics();
                return [4 /*yield*/, expect(m.timing('metric')).rejects.toThrow(/value/)];
            case 1:
                _a.sent();
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metrics handles "before" calls', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var before, m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                before = function (metricType, metric, options) { return (new Promise(function (resolve) {
                    var thisMetric = metric;
                    thisMetric.value = 10;
                    thisMetric.metric = "prefix." + metric.metric;
                    var result = { metricType: metricType, options: options, metric: thisMetric };
                    resolve(result);
                })); };
                m = new index_1.Metrics(['console'], { before: before });
                return [4 /*yield*/, m.increment('metric')];
            case 1:
                _a.sent();
                expect(spies.info.mock.calls[0][0]).toMatch(/prefix\.metric.+10$/);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metrics handles layer "before" calls', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var before, m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                before = function (metricType, metric, options) { return (new Promise(function (resolve) {
                    var thisMetric = metric;
                    thisMetric.value = 10;
                    thisMetric.metric = "prefix." + metric.metric;
                    var result = { metricType: metricType, options: options, metric: thisMetric };
                    resolve(result);
                })); };
                m = new index_1.Metrics([{ type: 'console', before: before }]);
                return [4 /*yield*/, m.increment('metric')];
            case 1:
                _a.sent();
                expect(spies.info.mock.calls[0][0]).toMatch(/prefix\.metric.+10$/);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metrics handles "after" calls', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var afterCalled, after, m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                afterCalled = false;
                after = function (results) { return (new Promise(function (resolve) {
                    afterCalled = true;
                    resolve(results);
                })); };
                m = new index_1.Metrics(['console'], { after: after });
                return [4 /*yield*/, m.increment('metric')];
            case 1:
                _a.sent();
                expect(afterCalled).toBe(true);
                done();
                return [2 /*return*/];
        }
    });
}); });
test('Metrics has an onError hook', function (done) { return __awaiter(void 0, void 0, void 0, function () {
    var options, spy, m, endpoint, unmute;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                options = {
                    onError: function (error) {
                    },
                };
                spy = jest.spyOn(options, 'onError');
                m = new index_1.Metrics([
                    { type: 'json_post', host: 'metrics.example.com' },
                ], options);
                endpoint = nock(/example\.com/).post('/').reply(500, {});
                unmute = jest_mock_console_1.default();
                return [4 /*yield*/, m.silent().increment('metric')];
            case 1:
                _a.sent();
                unmute();
                expect(spy).toHaveBeenCalled();
                done();
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=metrics.js.map