import nock from 'nock';

import {Logger} from '../src/index';

const spies = {
  log: jest.spyOn(global.console, 'log'),
  info: jest.spyOn(global.console, 'info'),
  error: jest.spyOn(global.console, 'error'),
  warn: jest.spyOn(global.console, 'warn'),
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

test('Logger with console logs to console', async (done) => {
  const l = new Logger(['console']);
  await l.log('my message')
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
  const l = new Logger([{type: 'console'}]);
  expect(l.layers).toHaveLength(1);
});

test('Logger with POST layer gets correct layer', () => {
  const l = new Logger([{
    type: 'json_post',
  }]);
  expect(l.layers).toHaveLength(1);
});

test('Logger handles "before" callbacks', async (done) => {
  const before = function (message: string, payload?: object) {
    return new Promise((resolve) => {
      const result = {payload, message: message + '!', options: this.options};
      resolve(result);
    });
  };
  const l = new Logger(['console'], {before});

  expect(l.options).toHaveProperty('before');

  await l.log('hi');
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
  done();
});

test('Logger handles a call-specific "before" callback', async (done) => {
  const before = function (message: string, payload?: object) {
    return new Promise((resolve) => {
      const result = { payload, message: message + '!', options: this.options };
      resolve(result);
    });
  };
  const l = new Logger(['console']);

  await l.log('hi', null, { before });
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain('hi!');
  done();
});

test('Logger handlers "after" callbacks', async (done) => {
  const after = function (message: string, payload?: object) {
    console.log('after');
    return new Promise((resolve) => {
      const result = { payload, message: message + '!', options: this.options };
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
