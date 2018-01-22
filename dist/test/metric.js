"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metric_1 = require("../src/models/metric");
describe('Creating Metric instances from arrays', () => {
    [
        {
            test: ['metric'],
            expected: {
                metric: 'metric',
                category: null,
                value: null,
            }
        },
        {
            test: ['category', 'metric'],
            expected: {
                metric: 'metric',
                category: 'category',
                value: null,
            }
        }
    ].forEach((testCase, ix) => {
        test(ix + ': Create Metric instance from ' + JSON.stringify(testCase.test), () => {
            const m = new metric_1.default(...testCase.test);
            expect(m).toMatchObject(testCase.expected);
        });
    });
});
test('Create Metric instance from Metric instance', () => {
    const m = new metric_1.default('metric');
    const m2 = new metric_1.default(m);
    expect(m2.metric).toBe('metric');
});
//# sourceMappingURL=metric.js.map