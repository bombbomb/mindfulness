import { Metrics } from '../src/index';
import { MetricsOptions, MetricInterface } from '../src/interfaces/metrics';

const spies = {
  // log: jest.spyOn(global.console, 'log'),
  info: jest.spyOn(global.console, 'info'),
  // error: jest.spyOn(global.console, 'error'),
  // warn: jest.spyOn(global.console, 'warn'),
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

test('Metris.increment() sends metric', async (done) => {
  const m = new Metrics();
  await m.increment('metric');
  expect(spies.info).toHaveBeenCalled();
  done();
});

test('Metris.timing() sends metric', async (done) => {
  const m = new Metrics();
  await m.timing('metric', 100);
  expect(spies.info).toHaveBeenCalled();
  done();
});

test('Metrics.timing() fails with no value', async (done) => {
  const m = new Metrics();
  await expect(m.timing('metric')).rejects.toThrow(/value/);
  done();
});

test('Metrics handles "before" calls', async (done) => {
  const before = (metricType: string, metric: MetricInterface, options: MetricsOptions) => (
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

  done();
});

test('Metrics handles layer "before" calls', async (done) => {
  const before = (metricType: string, metric: MetricInterface, options: MetricsOptions) => (
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

  done();
});

test('Metrics handles "after" calls', async (done) => {
  let afterCalled = false;
  const after = results => (
    new Promise((resolve) => {
      afterCalled = true;
      resolve(results);
    })
  );

  const m = new Metrics(['console'], { after });
  await m.increment('metric');

  expect(afterCalled).toBe(true);

  done();
});
