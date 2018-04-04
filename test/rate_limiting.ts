import RateLimiter from '../src/contrib/rate_limiter';
import { Logger } from '../src/index';

const logSpy = jest.spyOn(console, 'log');

beforeEach(() => {
  logSpy.mockReset();
});

test('rate limit is not triggered by default', async (done) => {
  const r = new RateLimiter();
  expect(r.allowed({ message: 'test' })).toBe(true);
  expect(Object.keys(r.messages)).toHaveLength(1);
  done();
});

test('rate limit honors message threshold', async (done) => {
  const r = new RateLimiter();
  const options = { rateLimitMessageThreshold: 1 };
  expect(r.allowed({ message: 'test' }, options)).toBe(true);
  expect(r.allowed({ message: 'test' }, options)).toBe(false);
  expect(Object.keys(r.messages)).toHaveLength(1);
  done();
});

test('rate limit will allow messages when the old messages have expired', async (done) => {
  const r = new RateLimiter();
  const options = { rateLimitExpiration: 10, rateLimitMessageThreshold: 1 };
  expect(r.allowed({ message: 'test' }, options)).toBe(true);

  // so messages should expire after 10ms, so calling a new message after 20ms
  // should not trip rate limiting
  setTimeout(() => {
    expect(r.allowed({ message: 'test' }, options)).toBe(true);
    expect(Object.keys(r.messages)).toHaveLength(1);
    done();
  }, 20);
});

test('rate limit honors message key as separate messages', async (done) => {
  const r = new RateLimiter();
  const options = { rateLimitKey: 'message' };
  expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
  expect(r.allowed({ message: 'test 2' }, options)).toBe(true);
  expect(Object.keys(r.messages)).toHaveLength(2);
  done();
});

test('rate limit blocks repeat messages with specific key', async (done) => {
  const r = new RateLimiter();
  const options = { rateLimitMessageThreshold: 1, rateLimitKey: 'message' };
  expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
  expect(r.allowed({ message: 'test 2' }, options)).toBe(true);
  expect(r.allowed({ message: 'test 2' }, options)).toBe(false);
  expect(Object.keys(r.messages)).toHaveLength(2);
  done();
});

test('rate limit garbage collection does not remove fresh messages', async (done) => {
  const r = new RateLimiter();
  const options = { rateLimitKey: 'message' };
  expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
  expect(r.allowed({ message: 'test 2' }, options)).toBe(true);

  r.collectGarbage(options, true);

  expect(Object.keys(r.messages)).toHaveLength(2);
  done();
});

test('rate limit garbage collection removes stale messages', async (done) => {
  const r = new RateLimiter();
  const options = { rateLimitKey: 'message', rateLimitStaleTime: 10 };
  expect(r.allowed({ message: 'test 1' }, options)).toBe(true);
  expect(r.allowed({ message: 'test 2' }, options)).toBe(true);

  setTimeout(() => {
    r.collectGarbage(options, true);

    expect(Object.keys(r.messages)).toHaveLength(0);
    done();
  }, 20);
});

test('rate limit log messages', async (done) => {
  const l = new Logger(['console'], {
    rateLimit: true,
    rateLimitMessageThreshold: 1,
  });

  await l.log('message');
  await l.log('message');
  expect(logSpy).toHaveBeenCalledTimes(1);
  done();
});

test('rate limit log messages with a filter', async (done) => {
  const l = new Logger(['console'], {
    rateLimit: true,
    rateLimitMessageThreshold: 1,
    rateLimitFilter: (details) => {
      if (details.message === 'message') {
        return true;
      }
      return false;
    },
  });

  await l.log('message');
  await l.log('message');
  await l.log('message2');
  expect(logSpy).toHaveBeenCalledTimes(2);
  done();
});
