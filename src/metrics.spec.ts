import { Metrics } from './index';
import { MetricInterface } from './interfaces/metrics';
import { MindfulnessOptions } from './interfaces/options';

const spies = {
  info: jest.spyOn(global.console, 'info'),
};

const mockIncrement = jest.fn().mockImplementation(() => Promise.resolve());

jest.mock('./contrib/json_post', () => ({
  JsonPostMetrics: class {
    increment = mockIncrement;
  },
  JsonPostLogger: class {
    increment = mockIncrement;
  },
}));

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

beforeEach(() => {
  mockIncrement.mockReset();
});

test('Metrics with no layers defaults to console', () => {
  const m = new Metrics();
  expect(m.layers).toHaveLength(1);
});

test('Metrics works with null layer', () => {
  const m = new Metrics(['null']);
  expect(m.layers).toHaveLength(1);
});

test('Metrics works with type:null layer', () => {
  const m = new Metrics([{ type: 'null' }]);
  expect(m.layers).toHaveLength(1);
});

test('Metrics.increment() sends metric', async () => {
  const m = new Metrics();
  await m.increment('metric');
  expect(spies.info).toHaveBeenCalled();
});

test('Metrics.timing() sends metric', async () => {
  const m = new Metrics();
  await m.timing('metric', 100);
  expect(spies.info).toHaveBeenCalled();
});

test('Metrics.timing() fails with no value', async () => {
  const m = new Metrics();
  await expect(m.timing('metric')).rejects.toThrow(/value/);
});

test('Metrics handles "before" calls', async () => {
  const before = (metricType: string, metric: MetricInterface, options: MindfulnessOptions) => (
    new Promise((resolve) => {
      const thisMetric = metric;
      thisMetric.value = 10;
      thisMetric.metric = `prefix.${metric.metric}`;
      const result = { metricType, options, metric: thisMetric };
      resolve(result);
    })
  );

  const m = new Metrics(['console'], { before });
  await m.increment('metric');

  expect(spies.info.mock.calls[0][0]).toMatch(/prefix\.metric.+10$/);
});

test('Metrics handles layer "before" calls', async () => {
  const before = (metricType: string, metric: MetricInterface, options: MindfulnessOptions) => (
    new Promise((resolve) => {
      const thisMetric = metric;
      thisMetric.value = 10;
      thisMetric.metric = `prefix.${metric.metric}`;
      const result = { metricType, options, metric: thisMetric };
      resolve(result);
    })
  );

  const m = new Metrics([{ type: 'console', before }]);
  await m.increment('metric');

  expect(spies.info.mock.calls[0][0]).toMatch(/prefix\.metric.+10$/);
});

test('Metrics handles "after" calls', async () => {
  let afterCalled = false;
  const after = (results) => (
    new Promise((resolve) => {
      afterCalled = true;
      resolve(results);
    })
  );

  const m = new Metrics(['console'], { after });
  await m.increment('metric');

  expect(afterCalled).toBe(true);
});

test('Metrics has an onError hook', async () => {
  const options = {
    onError: jest.fn(),
  };

  const m = new Metrics([
    { type: 'json_post', host: 'metrics.example.com' },
  ], options);

  mockIncrement.mockRejectedValue(new Error());

  await m.silent().increment('metric');

  expect(options.onError).toHaveBeenCalled();
  expect(mockIncrement).toHaveBeenCalled();
});
