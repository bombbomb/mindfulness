import mute from 'jest-mock-console';
import { ConsoleLogger } from '../src/contrib/console';
import { LOG_LEVELS } from '../src/interfaces/logger';

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

test('ConsoleLogger logs to the console', async (done) => {
  const l = new ConsoleLogger();
  const message = 'my message';
  const unmute = mute();
  await l.log(message);
  expect(console.log).toHaveBeenCalled();
  // @ts-ignore
  expect(console.log.mock.calls[0]).toContain(message);
  unmute();
  done();
});

test('ConsoleLogger logInfo sends info log', async (done) => {
  const l = new ConsoleLogger();
  const message = 'info message';
  await l.logInfo(message);
  expect(spies.info).toHaveBeenCalled();
  expect(spies.info.mock.calls[0]).toContain(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});

test('ConsoleLogger logWarn sends warn log', async (done) => {
  const l = new ConsoleLogger();
  const message = 'warn message';
  await l.logWarn(message);
  expect(spies.warn).toHaveBeenCalled();
  expect(spies.warn.mock.calls[0]).toContain(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});

test('ConsoleLogger logError sends error log', async (done) => {
  const l = new ConsoleLogger();
  const message = 'error message';
  await l.logError(message);
  expect(spies.error).toHaveBeenCalled();
  expect(spies.error.mock.calls[0]).toContain(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});

test('ConsoleLogger honors log level', async (done) => {
  const l = new ConsoleLogger({ logLevel: LOG_LEVELS.LOG_NONE });
  await l.log('message');
  expect(spies.log).toHaveBeenCalledTimes(0);

  l.options.logLevel = LOG_LEVELS.LOG_LOG;
  await l.log('message');
  expect(spies.log).toHaveBeenCalledTimes(1);

  done();
});

test('ConsoleLogger honors multiple log levels', async (done) => {
  const l = new ConsoleLogger({ logLevel: LOG_LEVELS.LOG_LOG | LOG_LEVELS.LOG_ERROR });
  await l.log('message');
  await l.logError('message');
  await l.logInfo('message');
  expect(spies.log).toHaveBeenCalledTimes(1);
  expect(spies.error).toHaveBeenCalledTimes(1);
  expect(spies.info).toHaveBeenCalledTimes(0);

  done();
});
