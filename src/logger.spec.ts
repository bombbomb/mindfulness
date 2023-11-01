import { Logger } from './index';
import { JsonPostLogger } from './contrib/JsonPostLogger';
import { ConsoleLogger } from './contrib/console';

const spies = {
  log: jest.spyOn(global.console, 'log'),
  info: jest.spyOn(global.console, 'info'),
  error: jest.spyOn(global.console, 'error'),
  // warn: jest.spyOn(global.console, 'warn'),
};

beforeEach(() => {
  global.fetch = jest.fn();
});

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

test('Logger with console logs to console', async (done) => {
  const l = new Logger(['console']);
  await l.log('my message');
  expect(spies.log).toHaveBeenCalled();
  done();
});

test('Logger with no arguments gets console layer', async () => {
  const l = new Logger();
  expect(l.layers).toHaveLength(1);
  await l.log('my message');
  expect(spies.log).toHaveBeenCalled();
});

test('Logger with console layer gets correct layer', () => {
  const l = new Logger([{ type: 'console' }]);
  expect(l.layers).toHaveLength(1);
});

test('Logger with POST layer gets correct layer', () => {
  const l = new Logger([{
    type: 'json_post',
  }]);
  expect(l.layers).toHaveLength(1);
});

test('Logger with incorrect layer throws error', () => {
  expect(() => new Logger([{ type: 'fake_logger' }])).toThrowError();
});

test('Logger handles "before" callbacks', async () => {
  const before = (message: string, payload?: object, options?: object) => (
    new Promise((resolve) => {
      const result = { payload, message: `${message}!`, options };
      resolve(result);
    })
  );
  const l = new Logger(['console'], { before });

  expect(l.options).toHaveProperty('before');
  expect((l.layers[0] as ConsoleLogger).options).not.toHaveProperty('before');

  await l.log('hi');
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
});

test('Logger handles layer "before" callbacks', async () => {
  const before = (message: string, payload?: object, options?: object) => (
    new Promise((resolve) => {
      const result = { payload, message: `${message}!`, options };
      resolve(result);
    })
  );
  const l = new Logger([{ type: 'console', before }]);

  expect((l.layers[0] as ConsoleLogger).options).toHaveProperty('before');

  await l.log('hi');
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
});

test('Logger handles a call-specific "before" callback', async () => {
  const before = function (details) {
    return new Promise((resolve) => {
      const result = { payload: details.payload, message: `${details.message}!`, options: this.options };
      resolve(result);
    });
  };

  // don't pass the "before" function here
  const l = new Logger(['console']);

  // but pass it on the call
  await l.log('hi', null, { before });

  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
  // logger options should not be changed by the before handler.
  expect(l.options).not.toHaveProperty('before');
});

test('Logger handlers "after" callbacks', async () => {
  const after = function (message: string, payload?: object) {
    return new Promise((resolve) => {
      const result = { payload, message: `${message}!`, options: this.options };
      resolve(result);
    });
  };
  const l = new Logger(['console'], { after });
  const spy = jest.spyOn(l.options, 'after');

  expect(l.options).toHaveProperty('after');

  await l.log('hi');
  expect(spies.log).toHaveBeenCalled();
  expect(spy).toHaveBeenCalled();
});

test('Logger alwaysSilent option stops all request errors', async () => {
  jest.mocked(global.fetch).mockResolvedValue({ ok: false } as unknown as Response);

  const l = new Logger([{ type: 'json_post', host: 'http://logging.example.com' }], { alwaysSilent: true });
  await l.log('Message 1');
  await l.log('Message 2');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('Logger without alwaysSilent fails on request errors', async () => {
  jest.mocked(global.fetch).mockResolvedValue({ ok: false } as unknown as Response);
  const l = new Logger([{ type: 'json_post', host: 'http://logging.example.com' }], { alwaysSilent: false });

  await expect(() => l.log('Message1')).rejects.toThrowError();
});

test('Logger filterLayers with string', () => {
  const l = new Logger(['console', { type: 'json_post' }]);
  expect(l.layers[0].active).toBe(true);
  expect(l.layers[1].active).toBe(true);

  l.filterLayers('console');

  expect(l.layers[0].active).toBe(true);
  expect(l.layers[1].active).toBe(false);
});

test('Logger filterLayers with callback', () => {
  const l = new Logger(['console', { type: 'json_post' }]);
  expect(l.layers[0].active).toBe(true);
  expect(l.layers[1].active).toBe(true);

  l.filterLayers((layer) => layer instanceof JsonPostLogger);

  expect(l.layers[0].active).toBe(false);
  expect(l.layers[1].active).toBe(true);
});

test('Logger calls can specify which layer to use for this call', async () => {
  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  const l = new Logger(['console', { type: 'json_post', host: 'http://logging.example.com' }]);

  await l.filterLayers('console').logError('Something went wrong');
  expect(spies.error).toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('Logger calls can specify which layer to use for this call only', async () => {
  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  const l = new Logger(['console', { type: 'json_post', host: 'http://logging.example.com' }]);

  await l.filterLayers('console').logError('Something went wrong');
  expect(spies.error).toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();

  // all layers should be active...
  for (let index = 0; index < l.layers.length; index += 1) {
    expect(l.layers[index].active).toBe(true);
  }

  await l.log('Message');
  expect(spies.log).toHaveBeenCalled();
  expect(global.fetch).toHaveBeenCalled();
});

test('logError with error stack', async () => {
  const message = 'Nothing ever works';
  jest.mocked(global.fetch).mockResolvedValue({ ok: true } as unknown as Response);
  const l = new Logger([{ type: 'json_post', host: 'http://logging.example.com' }]);

  try {
    throw new Error(message);
  }
  catch (err) {
    await l.logError(err, err.stack);
  }

  expect(global.fetch).toHaveBeenCalled();
});

test('Logger with null layer works', async () => {
  const l = new Logger(['null']);
  expect(l.layers).toHaveLength(1);

  await l.log('Things!');
});

test('Logger with type:null layer works', async () => {
  const l = new Logger([{ type: 'null' }]);
  expect(l.layers).toHaveLength(1);

  await l.log('Things!');
});

test('Logger exposes LOG_LEVELS', () => {
  expect(Logger.LOG_LEVELS).toBeDefined();
});
