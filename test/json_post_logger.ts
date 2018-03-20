import nock from 'nock';
import mute from 'jest-mock-console';
import { Logger } from '../src/index';

afterEach(() => {
  nock.cleanAll();
});

test('log via post request to example.com', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: {},
      environment: 'test',
    })
    .reply(200, {});

  await l.log('Hello!');

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('log via post payload request to example.com', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: { example: 123 },
      environment: 'test',
    })
    .reply(200, {});

  await l.log('Hello!', { example: 123 });

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('log object for message', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', (req) => {
      expect(req).toEqual({
        severity: 'log',
        type: 'log',
        message: '{"example":123}',
        info: {},
        environment: 'test',
      });
      return true;
    })
    .reply(200, {});

  await l.log({ example: 123 });

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('log error for payload', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', (req) => {
      expect(req).toMatchObject({
        severity: 'log',
        type: 'log',
        message: 'Error doing things',
        info: {
          message: 'You did everything wrong',
          stack: expect.any(String),
        },
      });
      return true;
    })
    .reply(200, {});

  const unmute = mute();
  await l.log('Error doing things', new Error('You did everything wrong'));
  unmute();

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('can debug', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com', debug: true },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: { example: 123 },
      environment: 'test',
    })
    .reply(200, {});


  const c = { ...console };
  console.info = jest.fn();

  await l.log('Hello!', { example: 123 });
  expect(console.info).toHaveBeenCalled();
  expect(loggingEndpoint.isDone()).toBe(true);

  console = c;

  done();
});

test('can change request body', async (done) => {
  const l = new Logger([
    {
      type: 'json_post',
      host: 'logging.example.com',
      requestBodyCallback: (body, details) => ({
        ...body,
        injected: 123,
      }),
    },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', (req) => {
      expect(req).toMatchObject({
        severity: 'log',
        type: 'log',
        message: 'Error doing things',
        injected: 123,
        info: {
          payload: 234,
        },
      });
      return true;
    })
    .reply(200, {});

  const unmute = mute();
  await l.log('Error doing things', { payload: 234 });
  unmute();

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('can include data defaults', async (done) => {
  const l = new Logger([
    {
      type: 'json_post',
      host: 'logging.example.com',
      dataDefaults: { xsrc: 'example' },
    },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', (req) => {
      expect(req).toMatchObject({
        severity: 'log',
        type: 'log',
        message: 'Error doing things',
        xsrc: 'example',
        environment: 'test',
        info: {
          payload: 234,
        },
      });
      return true;
    })
    .reply(200, {});

  await l.log('Error doing things', { payload: 234 });

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('can change request body on a call', async (done) => {
  const l = new Logger([
    {
      type: 'json_post',
      host: 'logging.example.com',
    },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', (req) => {
      expect(req).toMatchObject({
        severity: 'log',
        type: 'log',
        message: 'Error doing things',
        injected: 123,
        environment: 'test',
        info: {
          payload: 234,
        },
      });
      return true;
    })
    .reply(200, {});

  const unmute = mute();
  await l.log('Error doing things', { payload: 234 }, {
    requestBodyCallback: (body, details) => ({
      ...body,
      injected: 123,
    }),
  });
  unmute();

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('log fails on post error', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ], { alwaysSilent: false });

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: {},
      environment: 'test',
    })
    .reply(500, {});

  const unmute = mute();
  await expect(l.log('Hello!')).rejects.toThrow();
  unmute();

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('$level variables is processed in the url', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com', path: '/$level' },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/log', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: {},
      environment: 'test',
    })
    .reply(200, {});

  await l.log('Hello!');

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('logging does not fail when the host includes the scheme', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'http://logging.example.com' },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: {},
      environment: 'test',
    })
    .reply(200, {});

  await l.log('Hello!');

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

describe('log silent()', () => {
  test('stops an error from propegating', async (done) => {
    const l = new Logger([
      { type: 'json_post', host: 'logging.example.com' },
    ]);

    const loggingEndpoint = nock('http://logging.example.com')
      .post('/', {
        severity: 'log',
        type: 'log',
        message: 'Hello!',
        info: {},
        environment: 'test',
      })
      .reply(500, {});

    const unmute = mute();
    await expect(l.silent().log('Hello!')).resolves.not.toThrow();
    unmute();
    done();
  });
});

test('getRequestUri() handles trailing slash in host', () => {
  const l = new Logger([
    { type: 'json_post', host: 'http://logging.example.com/' },
  ]);

  expect(l.layers[0].json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: '/test' }))
    .toBe('http://logging.example.com/test');
});

test('getRequestUri() handles scheme from host slash in host', () => {
  const l = new Logger([
    { type: 'json_post', host: 'https://logging.example.com/' },
  ]);

  expect(l.layers[0].json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: '/test' })).toBe('https://logging.example.com/test');
});

test('getRequestUri() handles missing leading slash in path', () => {
  const l = new Logger([
    { type: 'json_post', host: 'http://logging.example.com' },
  ]);

  expect(l.layers[0].json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: 'test' })).toBe('http://logging.example.com/test');
});

test('json post honors log levels', async (done) => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com', logLevel: Logger.LOG_LEVELS.LOG_LOG },
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: {},
      environment: 'test',
    })
    .reply(200, {});

  await l.log('Hello!');

  // this should get ignored, will throw a nock error if it doesn't...
  await l.logInfo('Info!');

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});
