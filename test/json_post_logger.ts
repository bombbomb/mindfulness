import nock from 'nock';
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

  await l.log('Error doing things', new Error('You did everything wrong'));

  expect(loggingEndpoint.isDone()).toBe(true);
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

  await l.log('Error doing things', { payload: 234 });

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

  await l.log('Error doing things', { payload: 234 }, {
    requestBodyCallback: (body, details) => ({
      ...body,
      injected: 123,
    }),
  });

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('log fails on post error', async (done) => {
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

  await expect(l.log('Hello!')).rejects.toThrow();

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

    await expect(l.silent().log('Hello!')).resolves.not.toThrow();
    done();
  });
});
