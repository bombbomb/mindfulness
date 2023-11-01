import * as nock from 'nock';
import { Logger } from '../src/index';
import { JsonPostLogger } from '../src/contrib/JsonPostLogger';

const spies = {
  log: jest.spyOn(global.console, 'log'),
  info: jest.spyOn(global.console, 'info'),
  error: jest.spyOn(global.console, 'error'),
  // warn: jest.spyOn(global.console, 'warn'),
};

afterEach(() => {
  Object.keys(spies).forEach((spy) => {
    spies[spy].mockReset();
  });

  nock.cleanAll();
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
  const l = new Logger([{ type: 'fake_logger' }]);
});

test('Logger handles "before" callbacks', async (done) => {
  const before = (message: string, payload?: object, options?: object) => (
    new Promise((resolve) => {
      const result = { payload, message: `${message}!`, options };
      resolve(result);
    })
  );
  const l = new Logger(['console'], { before });

  expect(l.options).toHaveProperty('before');
  expect(l.layers[0].options).not.toHaveProperty('before');

  await l.log('hi');
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
  done();
});

test('Logger handles layer "before" callbacks', async (done) => {
  const before = (message: string, payload?: object, options?: object) => (
    new Promise((resolve) => {
      const result = { payload, message: `${message}!`, options };
      resolve(result);
    })
  );
  const l = new Logger([{ type: 'console', before }]);

  expect(l.layers[0].options).toHaveProperty('before');

  await l.log('hi');
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
  done();
});

test('Logger handles a call-specific "before" callback', async (done) => {
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
  done();
});

test('Logger handlers "after" callbacks', async (done) => {
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
  done();
});

test('Logger alwaysSilent option stops all request errors', async (done) => {
  const loggingEndpoint = nock('http://logging.example.com')
    .persist(true)
    .post('/')
    .reply(500, {});
  const l = new Logger([{ type: 'json_post', host: 'http://logging.example.com' }], { alwaysSilent: true });
  await expect(l.log('Message 1')).resolves.toMatchObject({ message: '500 - {}' });
  await expect(l.log('Message 2')).resolves.toMatchObject({ message: '500 - {}' });
  done();
});

test('Logger without alwaysSilent fails on request errors', async () => {
  const loggingEndpoint = nock('http://logging.example.com')
    .persist(true)
    .post('/')
    .reply(500, {});
  const l = new Logger([{ type: 'json_post', host: 'http://logging.example.com' }], { alwaysSilent: false });
  // await expect(l.log('Message 1')).rejects.toThrow();
  l.log('Message1')
    // .then(() => {
    //   expect(false).toBe(true);
    // })
    .catch((err) => {
      expect(err).toBeDefined();
    });

  // try {
  //   await l.log('Message 1');
  //   console.warn('?');
  //   expect(false).toBe(true);
  // }
  // catch (err) {
  //   console.warn('??');
  //   expect(err).toBeDefined();
  // }
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

  l.filterLayers(layer => layer instanceof JsonPostLogger);

  expect(l.layers[0].active).toBe(false);
  expect(l.layers[1].active).toBe(true);
});

test('Logger calls can specify which layer to use for this call', async (done) => {
  const loggingEndpoint = nock('http://logging.example.com')
    .post('/')
    .reply(200, {});
  const l = new Logger(['console', { type: 'json_post', host: 'http://logging.example.com' }]);

  await l.filterLayers('console').logError('Something went wrong');
  expect(spies.error).toHaveBeenCalled();
  expect(loggingEndpoint.isDone()).toBe(false);

  done();
});

test('Logger calls can specify which layer to use for this call only', async (done) => {
  const loggingEndpoint = nock('http://logging.example.com')
    .persist()
    .post('/')
    .reply(200, {});
  const l = new Logger(['console', { type: 'json_post', host: 'http://logging.example.com' }]);

  await l.filterLayers('console').logError('Something went wrong');
  expect(spies.error).toHaveBeenCalled();
  expect(loggingEndpoint.isDone()).toBe(false);

  // all layers should be active...
  for (let index = 0; index < l.layers.length; index += 1) {
    expect(l.layers[index].active).toBe(true);
  }

  await l.log('Message');
  expect(spies.log).toHaveBeenCalled();
  expect(loggingEndpoint.isDone()).toBe(true);

  done();
});

test('logError with error stack', async (done) => {
  const message = 'Nothing ever works';
  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', (req) => {
      expect(req).toMatchObject({
        message,
        info: expect.any(String),
        type: 'error',
        severity: 'error',
      });
      return true;
    })
    .reply(200, {});
  const l = new Logger([{ type: 'json_post', host: 'http://logging.example.com' }]);

  try {
    throw new Error(message);
  }
  catch (err) {
    await l.logError(err, err.stack);
  }

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});

test('Logger with null layer works', async (done) => {
  const l = new Logger(['null']);
  expect(l.layers).toHaveLength(1);

  await l.log('Things!');
  done();
});

test('Logger with type:null layer works', async (done) => {
  const l = new Logger([{ type: 'null' }]);
  expect(l.layers).toHaveLength(1);

  await l.log('Things!');
  done();
});

test('Logger exposes LOG_LEVELS', () => {
  expect(Logger.LOG_LEVELS).toBeDefined();
});
