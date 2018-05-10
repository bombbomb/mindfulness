"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metric_1 = require("../src/models/metric");
describe('Creating Metric instances from arrays', function () {
    [
        {
            test: ['metric'],
            expected: {
                metric: 'metric',
                category: null,
                value: null,
            },
        },
        {
            test: ['category', 'metric'],
            expected: {
                metric: 'metric',
                category: 'category',
                value: null,
            },
        },
        {
            test: ['category', 'metric', 10],
            expected: {
                metric: 'metric',
                category: 'category',
                value: 10,
            },
        },
        {
            test: ['metric', 10],
            expected: {
                metric: 'metric',
                category: null,
                value: 10,
            },
        },
    ].forEach(function (testCase, ix) {
        test(ix + ": Create Metric instance from " + JSON.stringify(testCase.test), function () {
            var m = new (metric_1.default.bind.apply(metric_1.default, [void 0].concat(testCase.test)))();
            expect(m).toMatchObject(testCase.expected);
        });
    });
});
test('Create Metric instance from Metric instance', function () {
    var m = new metric_1.default('metric');
    var m2 = new metric_1.default(m);
    expect(m2.metric).toBe('metric');
});
test('Create metric with a date converts it to a timestamp', function () {
    var date = new Date();
    var m = new metric_1.default('metric', date);
    expect(m.metric).toBe('metric');
    expect(m.value).toBe(date.getTime());
});
//# sourceMappingURL=metric.js.map