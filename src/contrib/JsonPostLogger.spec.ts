import { Logger } from '../index';
import { JsonPostLogger } from './JsonPostLogger';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

interface ExtendedExpect extends jest.Expect {
  jsonContaining(...args: unknown[]): jest.CustomMatcherResult
}

function jsonContaining(data: string, expected: object): jest.CustomMatcherResult {
  const parsedData = JSON.parse(data);
  expect(parsedData).toMatchObject(expected);
  return { pass: true, message: () => 'success' };
}

expect.extend({ jsonContaining });

test('log via post request to example.com', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const log = jest.spyOn(l, 'call').mockImplementation(() => Promise.resolve());

  await l.log('Hello!');

  expect(log).toHaveBeenCalledWith('log', 'Hello!', undefined, undefined);
});

test('log via post payload request to example.com', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const log = jest.spyOn(l, 'call').mockImplementation(() => Promise.resolve());

  await l.log('Hello!', { example: 123 });

  expect(log).toHaveBeenCalledWith('log', 'Hello!', expect.objectContaining({ example: 123 }), undefined);
});

test('log object for message', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const log = jest.spyOn(l, 'call').mockImplementation(() => Promise.resolve());

  await l.log({ example: 123 });
  expect(log).toHaveBeenCalledWith('log', expect.objectContaining({ example: 123 }), undefined, undefined);
});

test('log error for payload', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ]);

  const log = jest.spyOn(l, 'call').mockImplementation(() => Promise.resolve());

  await l.log('Error doing things', new Error('You did everything wrong'));

  expect(log).toHaveBeenCalledWith('log', 'Error doing things', expect.anything(), undefined);
});

test('can debug', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com', debug: true },
  ]);

  // no implementation here to allow it go to JsonPostHandler.post
  const log = jest.spyOn(l, 'call');
  jest.mocked(global.fetch).mockImplementation(() => Promise.resolve({ ok: true } as unknown as Response));

  jest.spyOn(console, 'info');

  await l.log('Hello!', { example: 123 });
  expect(console.info).toHaveBeenCalled();
  expect(log).toHaveBeenCalledWith('log', 'Hello!', { example: 123 }, undefined);
});

test('can change request body', async () => {
  const l = new Logger([
    {
      type: 'json_post',
      host: 'logging.example.com',
      requestBodyCallback: (body) => ({
        ...body,
        injected: 123,
      }),
    },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({
    ok: true,
  } as unknown as Response);

  await l.log('Error doing things', { payload: 234 });

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('logging.example.com'),
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        injected: 123,
      }),
    }),
  );
});

test('can include data defaults', async () => {
  const l = new Logger([
    {
      type: 'json_post',
      host: 'logging.example.com',
      dataDefaults: { xsrc: 'example' },
    },
  ]);

  await l.log('Error doing things', { payload: 234 });

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('logging'),
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        xsrc: 'example',
        message: 'Error doing things',
      }),
    }),
  );
});

test('can change request body on a call', async () => {
  const l = new Logger([
    {
      type: 'json_post',
      host: 'logging.example.com',
    },
  ]);

  await l.log('Error doing things', { payload: 234 }, {
    requestBodyCallback: (body) => ({
      ...body,
      injected: 123,
    }),
  });

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('logging.example.com'),
    expect.objectContaining({
      body: (expect as ExtendedExpect).jsonContaining({
        injected: 123,
      }),
    }),
  );
});

test('log fails on post error', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com' },
  ], { alwaysSilent: true, debug: true });

  jest.mocked(global.fetch).mockImplementation(() => Promise.resolve({ ok: false } as unknown as Response));

  async function logThings() {
    return l.log('test');
  }
  await expect(logThings()).resolves.toThrowError();
});

test('$level variables is processed in the url', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com', path: '/$level' },
  ]);

  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);

  await l.log('Hello!');

  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/log'), expect.anything());
});

test('logging does not fail when the host includes the scheme', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'http://logging.example.com' },
  ]);

  await l.log('Hello!');

  expect(global.fetch).toHaveBeenCalledWith('http://logging.example.com/', expect.anything());
});

describe('log silent()', () => {
  test('stops an error from propagating', async () => {
    const l = new Logger([
      { type: 'json_post', host: 'logging.example.com' },
    ], { alwaysSilent: false });

    jest.mocked(global.fetch).mockResolvedValue({ ok: false, status: 500 } as unknown as Response);

    await expect(l.silent().log('Hello!')).resolves.toThrowError(/non-ok/i);
  });
});

test('getRequestUri() handles trailing slash in host', () => {
  const l = new Logger([
    { type: 'json_post', host: 'http://logging.example.com/' },
  ]);

  expect((l.layers[0] as JsonPostLogger).json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: '/test' }))
    .toBe('http://logging.example.com/test');
});

test('getRequestUri() handles scheme from host slash in host', () => {
  const l = new Logger([
    { type: 'json_post', host: 'https://logging.example.com/' },
  ]);

  expect((l.layers[0] as JsonPostLogger).json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: '/test' })).toBe('https://logging.example.com/test');
});

test('getRequestUri() handles missing leading slash in path', () => {
  const l = new Logger([
    { type: 'json_post', host: 'http://logging.example.com' },
  ]);

  expect((l.layers[0] as JsonPostLogger).json.getRequestUri({ level: 'log', message: 'hi', payload: {} }, { path: 'test' })).toBe('http://logging.example.com/test');
});

test('json post honors log levels', async () => {
  const l = new Logger([
    { type: 'json_post', host: 'logging.example.com', logLevel: Logger.LOG_LEVELS.LOG_LOG },
  ]);

  await l.log('Hello!');

  // this should get ignored, will throw a nock error if it doesn't...
  await l.logInfo('Info!');

  expect(global.fetch).toHaveBeenCalledTimes(1);
});
