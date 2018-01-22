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
test('Metrics logs to console.info by default', () => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics();
    yield m.increment('metric');
    expect(spies.info).toHaveBeenCalled();
}));
//# sourceMappingURL=console_metrics.js.map