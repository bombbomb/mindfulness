import nock from 'nock';
import { Metrics } from '../src/index';
import Metric from '../src/models/metric';

const spies = {
  // log: jest.spyOn(global.console, 'log'),
  info: jest.spyOn(global.console, 'info'),
  // error: jest.spyOn(global.console, 'error'),
  // warn: jest.spyOn(global.console, 'warn'),
};

afterEach(() => {
  nock.cleanAll();
});

test('JsonPostMetrics.getRequestOptions returns object', () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0];

  const obj = { headers: { 'X-Thing': 123 } };
  const result = jsonMetrics.getRequestOptions(obj, 'increment', new Metric('myMetric'), jsonMetrics.options);
  expect(result)
    .toMatchObject({
      ...obj,
      method: 'POST',
      uri: 'http://metrics.example.com/',
      body: {
        environment: 'test',
      },
    });
});

test('JsonPostMetrics.getRequestOptions honors process.env.ENVIRONMENT', () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0];

  const original = process.env.ENVIRONMENT;
  process.env.ENVIRONMENT = 'fake';
  const obj = { headers: { 'X-Thing': 123 } };
  const result = jsonMetrics.getRequestOptions(obj, 'increment', new Metric('myMetric'), jsonMetrics.options);
  process.env.ENVIRONMENT = original;
  expect(result)
    .toMatchObject({
      ...obj,
      method: 'POST',
      uri: 'http://metrics.example.com/',
      body: {
        environment: 'fake',
      },
    });
});

test('send metrics via post request to example.com', async (done) => {
  const m = new Metrics([
    { type: 'json_post', host: 'metrics.example.com' },
  ]);

  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: 'test',
      type: 'increment',
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('can debug metrics', async (done) => {
  const m = new Metrics([
    { type: 'json_post', host: 'metrics.example.com', debug: true },
  ]);

  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: 'test',
      type: 'increment',
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(spies.info).toHaveBeenCalled();
  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('send metrics via post request to example.com with scheme in host', async (done) => {
  const m = new Metrics([
    { type: 'json_post', host: 'http://metrics.example.com' },
  ]);

  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: 'test',
      type: 'increment',
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('Includes data defaults', async (done) => {
  const m = new Metrics([
    { type: 'json_post', host: 'http://metrics.example.com', dataDefaults: { xsrc: 'example' } },
  ]);

  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: 'test',
      type: 'increment',
      xsrc: 'example',
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('Can modify the request body with requestBodyCallback', async (done) => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      requestBodyCallback: (body: object, details: object) => {
        const newBody = {
          ...body,
          newElement: 123,
        };
        return newBody;
      },
    },
  ]);

  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: 'test',
      type: 'increment',
      newElement: 123,
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('Increment requests to a different URL', async (done) => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/increment',
      },
    },
  ]);

  const incorrectEndpoint = nock('http://metrics.example.com')
    .post('/')
    .reply(200, {});

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/increment', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('myMetric', 10);

  expect(incorrectEndpoint.isDone()).toBe(false);
  expect(correctEndpoint.isDone()).toBe(true);
  done();
});

test('Include metric value in the request URL', async (done) => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/path/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('myMetric', 10);

  expect(correctEndpoint.isDone()).toBe(true);
  done();
});

test('Include metric and category value in the request URL', async (done) => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/path/awesome/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('awesome', 'myMetric', 10);

  expect(correctEndpoint.isDone()).toBe(true);
  done();
});

test('"before" callbacks can change metric and category value in the request URL', async (done) => {
  const beforeCallback = {
    callback: (metricType, metric, options) => {
      const thisMetric = metric;
      thisMetric.metric = `prefix.${metric.metric}`;
      return Promise.resolve({ metricType, metric: thisMetric, options });
    },
  };

  const spy = jest.spyOn(beforeCallback, 'callback');

  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ], { before: beforeCallback.callback });

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/path/awesome/prefix.myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('awesome', 'myMetric', 10);
  expect(spy).toHaveBeenCalled();
  expect(correctEndpoint.isDone()).toBe(true);
  done();
});

test('layer "before" callbacks can change metric and category value in the request URL', async (done) => {
  const beforeCallback = {
    callback: (metricType, metric, options) => {
      const thisMetric = metric;
      thisMetric.metric = `prefix.${metric.metric}`;
      return Promise.resolve({ metricType, metric: thisMetric, options });
    },
  };

  const spy = jest.spyOn(beforeCallback, 'callback');

  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
      before: beforeCallback.callback,
    },
  ]);

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/path/awesome/prefix.myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('awesome', 'myMetric', 10);
  expect(spy).toHaveBeenCalled();
  expect(correctEndpoint.isDone()).toBe(true);
  done();
});

test('Metric post failure should throw an error', async (done) => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/path/awesome/myMetric', {
      environment: 'test',
      type: 'increment',
      value: 10,
    })
    .reply(500, {});

  await expect(m.increment('awesome', 'myMetric', 10))
    .rejects.toThrowError();

  done();
});

describe('Metric silent()', () => {
  test('stops errors from propegating', async (done) => {
    const m = new Metrics([
      {
        type: 'json_post',
        host: 'metrics.example.com',
        paths: {
          increment: '/path/$category/$metric',
        },
      },
    ]);

    const correctEndpoint = nock('http://metrics.example.com')
      .post('/path/awesome/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
      })
      .reply(500, {});

    await expect(m.silent().increment('awesome', 'myMetric', 10))
      .resolves.not.toThrowError();
    // errors are still captured in the object...
    expect(m.errors).toHaveLength(1);
    done();
  });

  test('only stops one error from propegating', async (done) => {
    const m = new Metrics([
      {
        type: 'json_post',
        host: 'metrics.example.com',
        paths: {
          increment: '/path/$category/$metric',
        },
      },
    ]);

    const correctEndpoint = nock('http://metrics.example.com')
      .post('/path/awesome/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
      })
      .reply(500, {});

    await expect(m.silent().increment('awesome', 'myMetric', 10))
      .resolves.not.toThrowError();
    expect(m.options.silent).toBe(false);
    await expect(m.increment('awesome', 'myMetric', 10))
      .rejects.toThrowError();

    done();
  });

  test('does not stop successful calls', async (done) => {
    const m = new Metrics([
      {
        type: 'json_post',
        host: 'metrics.example.com',
        paths: {
          increment: '/path/$category/$metric',
        },
      },
    ]);

    const correctEndpoint = nock('http://metrics.example.com')
      .post('/path/awesome/myMetric', {
        environment: 'test',
        type: 'increment',
        value: 10,
      })
      .reply(200, {});

    await expect(m.silent().increment('awesome', 'myMetric', 10))
      .resolves.not.toThrowError();

    done();
  });
});
