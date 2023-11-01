import { Metrics } from '../index';
import Metric from '../models/metric';
import { JsonPostMetrics } from './JsonPostMetrics';

interface ExtendedExpect extends jest.Expect {
  jsonContaining(...args: unknown[]): jest.CustomMatcherResult
}

function jsonContaining(data: string, expected: object): jest.CustomMatcherResult {
  const parsedData = JSON.parse(data);
  expect(parsedData).toMatchObject(expected);
  return { pass: true, message: () => 'success' };
}

expect.extend({ jsonContaining });

beforeEach(() => {
  global.fetch = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
  process.env.NODE_ENV = 'test';
  process.env.ENVIRONMENT = 'test';
});

test('JsonPostMetrics.getRequestOptions returns object', async () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0] as JsonPostMetrics;

  const obj = { headers: { 'X-Thing': '123' } };
  const result = await jsonMetrics.json.getRequestOptions(obj, { metricsType: 'increment', metric: new Metric('myMetric') }, jsonMetrics.options);

  expect(result)
    .toMatchObject({
      ...obj,
      method: 'POST',
      body: JSON.stringify({
        environment: process.env.NODE_ENV,
      }),
    });
});

test('JsonPostMetrics.getRequestOptions honors process.env.ENVIRONMENT', async () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0] as JsonPostMetrics;

  delete process.env.NODE_ENV;
  process.env.ENVIRONMENT = 'fake';
  const obj = { headers: { 'X-Thing': '123' } };
  const result = await jsonMetrics.json.getRequestOptions(obj, { metricsType: 'increment', metric: new Metric('myMetric') }, jsonMetrics.options);

  expect(result)
    .toMatchObject({
      ...obj,
      method: 'POST',
      body: JSON.stringify({
        environment: 'fake',
      }),
    });
});

test('JsonPostMetrics.getRequestOptions honors process.env.NODE_ENV', async () => {
  const m = new Metrics([{ type: 'json_post', host: 'metrics.example.com' }]);
  const jsonMetrics = m.layers[0] as JsonPostMetrics;

  delete process.env.ENVIRONMENT;
  process.env.NODE_ENV = 'fake';
  const obj = { headers: { 'X-Thing': '123' } };
  const result = await jsonMetrics.json.getRequestOptions(obj, { metricsType: 'increment', metric: new Metric('myMetric') }, jsonMetrics.options);

  expect(result)
    .toMatchObject({
      ...obj,
      method: 'POST',
      body: JSON.stringify({
        environment: 'fake',
      }),
    });
});

test('send metrics via post request to example.com', async () => {
  const m = new Metrics([
    { type: 'json_post', host: 'metrics.example.com', debug: true },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

  await m.increment('myMetric');

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('metrics.example.com'),
    expect.objectContaining({
      body: JSON.stringify({ type: 'increment', environment: 'test' }),
    }),
  );
});

test('send metrics via post request to https://example.com', async () => {
  const m = new Metrics([
    { type: 'json_post', host: 'https://metrics.example.com' },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

  await m.increment('myMetric');

  expect(global.fetch).toHaveBeenCalledWith(
    'https://metrics.example.com/',
    expect.objectContaining({
      body: JSON.stringify({ type: 'increment', environment: 'test' }),
    }),
  );
});

test('send JSON with JSON replacer', async () => {
  const replacer = jest.fn().mockImplementation((k, v) => {
    if (k === 'value') {
      return 123;
    }
    return v;
  });

  const m = new Metrics([
    {
      type: 'json_post',
      host: 'https://metrics.example.com',
      jsonReplacer: replacer,
    },
  ]);

  const date = new Date();

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

  await m.timing('myMetric', date);
  expect(replacer).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('metrics.example'),
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({ value: 123 }),
    }),
  );
});

test('can debug metrics', async () => {
  const m = new Metrics([
    { type: 'json_post', host: 'metrics.example.com', debug: true },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  const spy = jest.spyOn(console, 'info');

  await m.increment('myMetric');
  expect(spy).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('metrics.example.com'), expect.anything());
});

test('Includes data defaults', async () => {
  const m = new Metrics([
    { type: 'json_post', host: 'http://metrics.example.com', dataDefaults: { xsrc: 'example' } },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('myMetric');
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('metrics'),
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        xsrc: 'example',
      }),
    }),
  );
});

test('Can modify the request body with requestBodyCallback', async () => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      requestBodyCallback: (body: object) => {
        const newBody = {
          ...body,
          newElement: 123,
        };
        return newBody;
      },
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('myMetric');
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('metrics'),
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        newElement: 123,
      }),
    }),
  );
});

test('Increment requests to a different URL', async () => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/increment',
      },
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('myMetric', 10);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://metrics.example.com/increment',
    expect.anything(),
  );
});

test('Include metric value in the request URL', async () => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('myMetric', 10);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://metrics.example.com/path/myMetric',
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        value: 10,
      }),
    }),
  );
});

test('Include metric and category value in the request URL', async () => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('awesome', 'myMetric', 10);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://metrics.example.com/path/awesome/myMetric',
    expect.anything(),
  );
});

test('hybrid urls', async () => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/thing.$category/$metric',
      },
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('awesome.myMetric', 10);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://metrics.example.com/path/thing.awesome.myMetric',
    expect.anything(),
  );
});

test('"before" callbacks still build correct structure', async () => {
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

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

  await m.timing('awesome', 'myMetric', date);
  expect(spy).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledWith(
    'http://metrics.example.com/timing/awesome/myMetric',
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        value: 123,
      }),
    }),
  );
});

test('"before" callbacks can change metric and category value in the request URL', async () => {
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

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

  await m.increment('awesome', 'myMetric', 10);
  expect(spy).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalledWith(
    'http://metrics.example.com/path/awesome/prefix.myMetric',
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        value: 10,
      }),
    }),
  );
});

test('layer "before" callbacks can change metric and category value in the request URL', async () => {
  // Warning: you cannot use jest.fn() or jest.spyOn() here because it will
  // interfere with Mindfulness's ability to detect the number of arguments.
  const beforeCallback = (metricType, metric, options) => {
      const thisMetric = metric;
      thisMetric.metric = `prefix.${metric.metric}`;
      return Promise.resolve({ metricType, metric: thisMetric, options });
  };

  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
      before: beforeCallback,
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  await m.increment('awesome', 'myMetric', 10);
  expect(global.fetch).toHaveBeenCalledWith('http://metrics.example.com/path/awesome/prefix.myMetric', expect.anything());
});

describe('Metric silent()', () => {
  test('stops errors from propagating', async () => {
    const m = new Metrics([
      {
        type: 'json_post',
        host: 'metrics.example.com',
      },
    ], { alwaysSilent: false });

    const errorHandlerSpy = jest.spyOn(m, 'errorHandler');
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as unknown as Response);

    await m.silent().increment('awesome', 'myMetric', 10);
    expect(global.fetch).toHaveBeenCalled();
    expect(errorHandlerSpy).toHaveBeenCalled();

    // errors are still captured in the object...
    expect(m.errors).toHaveLength(1);
  });

  test('only stops one error from propagating', async () => {
    const m = new Metrics([
      {
        type: 'json_post',
        host: 'metrics.example.com',
        paths: {
          increment: '/path/$category/$metric',
        },
      },
    ], { alwaysSilent: false });

    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as unknown as Response);

    const errorHandlerSpy = jest.spyOn(m, 'errorHandler');

    await m.silent().increment('awesome', 'myMetric', 10);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
    expect(m.options.silent).toBe(false);

    // now it should call the error handler
    await expect(m.increment('awesome', 'myMetric', 10)).rejects.toThrowError();
    expect(errorHandlerSpy).toHaveBeenCalledTimes(2);
  });

  test('does not stop successful calls', async () => {
    const m = new Metrics([
      {
        type: 'json_post',
        host: 'metrics.example.com',
        paths: {
          increment: '/path/$category/$metric',
        },
      },
    ]);

    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

    await m.silent().increment('awesome', 'myMetric', 10);
    expect(global.fetch).toHaveBeenCalled();
  });
});

test('default json post failure logs instead of rejects', async () => {
  const m = new Metrics([
    {
      type: 'json_post',
      host: 'metrics.example.com',
      paths: {
        increment: '/path/$category/$metric',
      },
    },
  ]);

  console.error = jest.fn();
  await m.increment('awesome', 'myMetric', 10);
  expect(console.error).toHaveBeenCalled();
});
