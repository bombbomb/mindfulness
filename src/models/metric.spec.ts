import Metric from './metric';

describe('Creating Metric instances from arrays', () => {
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
  ].forEach((testCase, ix) => {
    test(`${ix}: Create Metric instance from ${JSON.stringify(testCase.test)}`, () => {
      const m = new Metric(...testCase.test);
      expect(m).toMatchObject(testCase.expected);
    });
  });
});

test('Create Metric instance from Metric instance', () => {
  const m = new Metric('metric');
  const m2 = new Metric(m);
  expect(m2.metric).toBe('metric');
});

test('Create metric with a date converts it to a timestamp', () => {
  const date = new Date();
  const m = new Metric('metric', date);

  expect(m.metric).toBe('metric');
  expect(m.value).toBe(date.getTime());
});
