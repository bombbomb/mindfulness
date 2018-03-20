import Mindfulness from '../src/contrib/mindfulness';
import { JsonPostHandler } from '../src/contrib/json_post';

class TestableMindfulness extends Mindfulness {
}

[
  {
    template: {
      key: 'key',
    },
    object: {
      key: '123',
    },
    expected: {
      key: '123',
    },
  },
  // optional keys are not returned with a value if not present
  {
    template: {
      'key?': 'key',
    },
    object: {
    },
    expected: {
    },
  },
  // optional keys are returned with a value if present
  {
    template: {
      'key?': 'key',
    },
    object: {
      key: 123,
    },
    expected: {
      key: 123,
    },
  },
  // optional keys support default values, but return specific value if possible
  {
    template: {
      'key?': ['key', 234],
    },
    object: {
      key: 123,
    },
    expected: {
      key: 123,
    },
  },
  {
    template: {
      'key?': ['key', 234],
    },
    object: {
    },
    expected: {
      key: 234,
    },
  },
  {
    template: {
      environment: '$environment',
    },
    object: {
      environment: 'something',
    },
    expected: {
      environment: 'test',
    },
  },
].forEach((testCase, ix) => {
  test(`JsonPostHandler.buildBody test #${ix}`, async () => {
    const m = new TestableMindfulness();
    const j = new JsonPostHandler(m);

    const result = await j.buildBody(testCase.object, { messageTemplate: testCase.template });
    expect(result).toMatchObject(testCase.expected);
  });
});
