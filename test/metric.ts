import Metric from '../src/models/metric';

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
