import nock from 'nock';
import mute from 'jest-mock-console';
import { Metrics } from '../src/index';
import Metric from '../src/models/metric';

const spies = {
  // log: jest.spyOn(global.console, 'log'),
  info: jest.spyOn(global.console, 'info'),
  error: jest.spyOn(global.console, 'error'),
  // warn: jest.spyOn(global.console, 'warn'),
};

afterEach(() => {
  nock.cleanAll();
  process.env.NODE_ENV = 'test';
  process.env.ENVIRONMENT = 'test';
});

test('JsonPostMetrics.getRequestOptions returns object', async () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0];

  const obj = { headers: { 'X-Thing': 123 } };
  const result = await jsonMetrics.json.getRequestOptions(obj, { metricsType: 'increment', metric: new Metric('myMetric') }, jsonMetrics.options);

  expect(result)
    .toMatchObject({
      ...obj,
      method: 'POST',
      uri: 'http://metrics.example.com/',
      body: {
        environment: process.env.NODE_ENV,
      },
    });
});

test('JsonPostMetrics.getRequestOptions honors process.env.ENVIRONMENT', async () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0];

  delete process.env.NODE_ENV;
  process.env.ENVIRONMENT = 'fake';
  const obj = { headers: { 'X-Thing': 123 } };
  const result = await jsonMetrics.json.getRequestOptions(obj, { metricsType: 'increment', metric: new Metric('myMetric') }, jsonMetrics.options);

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

test('JsonPostMetrics.getRequestOptions honors process.env.NODE_ENV', async () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0];

  delete process.env.ENVIRONMENT;
  process.env.NODE_ENV = 'fake';
  const obj = { headers: { 'X-Thing': 123 } };
  const result = await jsonMetrics.json.getRequestOptions(obj, { metricsType: 'increment', metric: new Metric('myMetric') }, jsonMetrics.options);

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
    { type: 'json_post', host: 'metrics.example.com', debug: true },
  ]);

  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: process.env.NODE_ENV,
      type: 'increment',
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('send metrics via post request to https://example.com', async (done) => {
  const m = new Metrics([
    { type: 'json_post', host: 'https://metrics.example.com' },
  ]);

  const metricsEndpoint = nock('https://metrics.example.com')
    .post('/', {
      environment: process.env.NODE_ENV,
      type: 'increment',
    })
    .reply(200, {});

  await m.increment('myMetric');

  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('send JSON with JSON replacer', async (done) => {
  const jsonReplacer = {
    replacer: (k, v) => {
      if (k === 'value') {
        return 123;
      }
      return v;
    },
  };

  const spy = jest.spyOn(jsonReplacer, 'replacer');

  const m = new Metrics([
    {
      type: 'json_post',
      host: 'https://metrics.example.com',
      jsonReplacer: jsonReplacer.replacer,
    },
  ]);

  const date = new Date();
  const metricsEndpoint = nock('https://metrics.example.com')
    .post('/', {
      environment: process.env.NODE_ENV,
      type: 'timing',
      value: 123,
    })
    .reply(200, {});

  await m.timing('myMetric', date);
  expect(spy).toHaveBeenCalled();
  expect(metricsEndpoint.isDone()).toBe(true);
  done();
});

test('can debug metrics', async (done) => {
  const m = new Metrics([
    { type: 'json_post', host: 'metrics.example.com', debug: true },
  ]);

  const unmute = mute();
  const metricsEndpoint = nock('http://metrics.example.com')
    .post('/', {
      environment: process.env.NODE_ENV,
      type: 'increment',
    })
    .reply(200, {});

  await m.increment('myMetric');
  unmute();

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
      environment: process.env.NODE_ENV,
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
      environment: process.env.NODE_ENV,
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
      environment: process.env.NODE_ENV,
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
        environment: process.env.NODE_ENV,
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
        environment: process.env.NODE_ENV,
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
        environment: process.env.NODE_ENV,
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('awesome', 'myMetric', 10);

  expect(correctEndpoint.isDone()).toBe(true);
  done();
});

test('"before" callbacks still build correct structure', async (done) => {
  const beforeCallback = {
    callback: (metricType, metric, options) => {
      const thisMetric = metric;
      thisMetric.value = 123;
      return Promise.resolve({ metricType, metric: thisMetric, options });
    },
  };

  const date = new Date();
  const spy = jest.spyOn(beforeCallback, 'callback');

  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        timing: '/timing/$category/$metric',
      },
    },
  ], { before: beforeCallback.callback });

  const correctEndpoint = nock('http://metrics.example.com')
    .post('/timing/awesome/myMetric', {
      environment: 'test',
      type: 'timing',
      value: 123,
    })
    .reply(200, {});

  await m.timing('awesome', 'myMetric', date);
  expect(spy).toHaveBeenCalled();
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
        environment: process.env.NODE_ENV,
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

  // const spy = jest.spyOn(beforeCallback, 'callback');

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
        environment: process.env.NODE_ENV,
        type: 'increment',
        value: 10,
    })
    .reply(200, {});

  await m.increment('awesome', 'myMetric', 10);
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
      environment: process.env.NODE_ENV,
      type: 'increment',
      value: 10,
    })
    .reply(500, {});


  const unmute = mute();
  await expect(m.increment('awesome', 'myMetric', 10))
    .rejects.toThrowError();
  unmute();

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
        environment: process.env.NODE_ENV,
        type: 'increment',
        value: 10,
      })
      .reply(500, {});

    const unmute = mute();
    await expect(m.silent().increment('awesome', 'myMetric', 10))
      .resolves.not.toThrowError();
    unmute();

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
        environment: process.env.NODE_ENV,
        type: 'increment',
        value: 10,
      })
      .reply(500, {});

    const unmute = mute();
    await expect(m.silent().increment('awesome', 'myMetric', 10))
      .resolves.not.toThrowError();

    expect(m.options.silent).toBe(false);
    await expect(m.increment('awesome', 'myMetric', 10))
      .rejects.toThrowError();
    unmute();

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
        environment: process.env.NODE_ENV,
        type: 'increment',
        value: 10,
      })
      .reply(200, {});

    await expect(m.silent().increment('awesome', 'myMetric', 10))
      .resolves.not.toThrowError();

    done();
  });
});

test('default json post failure logs instead of rejects', async (done) => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  const correctEndpoint = nock(/metrics\.example\.com/)
    .post(/.+/, body => true)
    .reply(500, {});

  const unmute = mute();
  await expect(m.increment('awesome', 'myMetric', 10)).rejects.toThrowError(/500/);
  expect(console.error).toHaveBeenCalled();
  unmute();

  done();
});
