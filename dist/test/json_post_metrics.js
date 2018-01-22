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
const nock_1 = require("nock");
const index_1 = require("../src/index");
const metric_1 = require("../src/models/metric");
test('JsonPostMetrics.getRequestOptions returns object', () => {
    const m = new index_1.Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
    const jsonMetrics = m.layers[0];
    const obj = { headers: { 'X-Thing': 123 } };
    const result = jsonMetrics.getRequestOptions(obj, 'increment', new metric_1.default('myMetric'), jsonMetrics.options);
    expect(result)
        .toMatchObject(Object.assign({}, obj, { method: 'POST', uri: 'http://metrics.example.com/', body: {
            environment: 'test'
        } }));
});
test('send metrics via post request to example.com', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        { type: 'json_post', host: 'metrics.example.com' }
    ]);
    const metricsEndpoint = nock_1.default('http://metrics.example.com')
        .post('/', {
        environment: 'test',
        type: 'increment'
    })
        .reply(200, {});
    yield m.increment('myMetric');
    expect(metricsEndpoint.isDone()).toBe(true);
    done();
}));
test('Can modify the request body with requestBodyCallback', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        {
            type: 'json_post',
            host: 'metrics.example.com',
            requestBodyCallback: (body, details) => {
                const newBody = Object.assign({}, body, { newElement: 123 });
                return newBody;
            }
        }
    ]);
    const metricsEndpoint = nock_1.default('http://metrics.example.com')
        .post('/', {
        environment: 'test',
        type: 'increment',
        newElement: 123,
    })
        .reply(200, {});
    yield m.increment('myMetric');
    expect(metricsEndpoint.isDone()).toBe(true);
    done();
}));
test('Decrement requests include a different type', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        {
            type: 'json_post',
            host: 'metrics.example.com',
        }
    ]);
    const metricsEndpoint = nock_1.default('http://metrics.example.com')
        .post('/', {
        environment: 'test',
        type: 'decrement',
        value: 10,
    })
        .reply(200, {});
    yield m.decrement('myMetric', 10);
    expect(metricsEndpoint.isDone()).toBe(true);
    done();
}));
test('Decrement requests to a different URL', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        {
            type: 'json_post',
            host: 'metrics.example.com',
            paths: {
                decrement: '/decrement',
            },
        }
    ]);
    const incorrectEndpoint = nock_1.default('http://metrics.example.com')
        .post('/')
        .reply(200, {});
    const correctEndpoint = nock_1.default('http://metrics.example.com')
        .post('/decrement', {
        environment: 'test',
        type: 'decrement',
        value: 10,
    })
        .reply(200, {});
    yield m.decrement('myMetric', 10);
    expect(incorrectEndpoint.isDone()).toBe(false);
    expect(correctEndpoint.isDone()).toBe(true);
    done();
}));
test('Include metric value in the request URL', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        {
            type: 'json_post',
            host: 'metrics.example.com',
            paths: {
                increment: '/path/$category/$metric',
            },
        }
    ]);
    const correctEndpoint = nock_1.default('http://metrics.example.com')
        .post('/path/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
        .reply(200, {});
    yield m.increment('myMetric', 10);
    expect(correctEndpoint.isDone()).toBe(true);
    done();
}));
test('Include metric and category value in the request URL', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        {
            type: 'json_post',
            host: 'metrics.example.com',
            paths: {
                increment: '/path/$category/$metric',
            },
        }
    ]);
    const correctEndpoint = nock_1.default('http://metrics.example.com')
        .post('/path/awesome/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
        .reply(200, {});
    yield m.increment('awesome', 'myMetric', 10);
    expect(correctEndpoint.isDone()).toBe(true);
    done();
}));
test('Metric post failure should throw an error', (done) => __awaiter(this, void 0, void 0, function* () {
    const m = new index_1.Metrics([
        {
            type: 'json_post',
            host: 'metrics.example.com',
            paths: {
                increment: '/path/$category/$metric',
            },
        }
    ]);
    const correctEndpoint = nock_1.default('http://metrics.example.com')
        .post('/path/awesome/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
        .reply(500, {});
    yield expect(m.increment('awesome', 'myMetric', 10))
        .rejects.toThrowError();
    done();
}));
describe('Metric silent()', () => {
    test('stops errors from propegating', (done) => __awaiter(this, void 0, void 0, function* () {
        const m = new index_1.Metrics([
            {
                type: 'json_post',
                host: 'metrics.example.com',
                paths: {
                    increment: '/path/$category/$metric',
                },
            }
        ]);
        const correctEndpoint = nock_1.default('http://metrics.example.com')
            .post('/path/awesome/myMetric', {
            environment: 'test',
            type: 'increment',
            value: 10,
        })
            .reply(500, {});
        yield expect(m.silent().increment('awesome', 'myMetric', 10))
            .resolves.not.toThrowError();
        // errors are still captured in the object...
        expect(m.errors).toHaveLength(1);
        done();
    }));
    test('only stops one error from propegating', (done) => __awaiter(this, void 0, void 0, function* () {
        const m = new index_1.Metrics([
            {
                type: 'json_post',
                host: 'metrics.example.com',
                paths: {
                    increment: '/path/$category/$metric',
                },
            }
        ]);
        const correctEndpoint = nock_1.default('http://metrics.example.com')
            .post('/path/awesome/myMetric', {
            environment: 'test',
            type: 'increment',
            value: 10,
        })
            .reply(500, {});
        yield expect(m.silent().increment('awesome', 'myMetric', 10))
            .resolves.not.toThrowError();
        expect(m.options.silent).toBe(false);
        yield expect(m.increment('awesome', 'myMetric', 10))
            .rejects.toThrowError();
        done();
    }));
    test('does not stop successful calls', (done) => __awaiter(this, void 0, void 0, function* () {
        const m = new index_1.Metrics([
            {
                type: 'json_post',
                host: 'metrics.example.com',
                paths: {
                    increment: '/path/$category/$metric',
                },
            }
        ]);
        const correctEndpoint = nock_1.default('http://metrics.example.com')
            .post('/path/awesome/myMetric', {
            environment: 'test',
            type: 'increment',
            value: 10,
        })
            .reply(200, {});
        yield expect(m.silent().increment('awesome', 'myMetric', 10))
            .resolves.not.toThrowError();
        done();
    }));
});
//# sourceMappingURL=json_post_metrics.js.map