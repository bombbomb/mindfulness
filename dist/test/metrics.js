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
    // log: jest.spyOn(global.console, 'log'),
    info: jest.spyOn(global.console, 'info'),
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
test('Metrics with no layers defaults to console', () => {
    const m = new index_1.Metrics();
    expect(m.layers).toHaveLength(1);
});
test('Metris.increment() sends metric', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics();
    yield m.increment('metric');
    expect(spies.info).toHaveBeenCalled();
    done();
}));
test('Metris.decrement() sends metric', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics();
    yield m.decrement('metric');
    expect(spies.info).toHaveBeenCalled();
    done();
}));
test('Metris.timing() sends metric', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics();
    yield m.timing('metric', 100);
    expect(spies.info).toHaveBeenCalled();
    done();
}));
test('Metrics.timing() fails with no value', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics();
    yield expect(m.timing('metric')).rejects.toThrow(/value/);
    done();
}));
test('Metrics handles "before" calls', (done) => __awaiter(this, void 0, void 0, function* () {
    const before = function (metricType, metric) {
        return new Promise((resolve) => {
            metric.value = 10;
            const result = { metric };
            resolve(result);
        });
    };
    const m = new index_1.Metrics(['console'], { before });
    yield m.increment('metric');
    expect(spies.info.mock.calls[0]).toContain(10);
    done();
}));
test('Metrics handles "after" calls', (done) => __awaiter(this, void 0, void 0, function* () {
    let afterCalled = false;
    const after = function (results) {
        return new Promise((resolve) => {
            afterCalled = true;
            resolve(results);
        });
    };
    const m = new index_1.Metrics(['console'], { after });
    yield m.increment('metric');
    expect(afterCalled).toBe(true);
    done();
}));
//# sourceMappingURL=metrics.js.map