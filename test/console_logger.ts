import {ConsoleLogger} from '../src/contrib/console';
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

test('ConsoleLogger.getLogLevelConstant', () => {
  const l = new ConsoleLogger(null);
  expect(l.getLogLevelConstant('log')).toBe(LOG_LEVELS.LOG_LOG);
  expect(l.getLogLevelConstant('info')).toBe(LOG_LEVELS.LOG_INFO);
});

test('ConsoleLogger logs to the console', async (done) => {
  const l = new ConsoleLogger(null);
  const message = 'my message';
  await l.log(message);
  expect(spies.log).toHaveBeenCalled();
  expect(spies.log.mock.calls[0]).toContain(message);
  done();
});

test('ConsoleLogger logInfo sends info log', async (done) => {
  const l = new ConsoleLogger(null);
  const message = 'info message';
  await l.logInfo(message);
  expect(spies.info).toHaveBeenCalled();
  expect(spies.info.mock.calls[0]).toContain(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});

test('ConsoleLogger logWarn sends warn log', async (done) => {
  const l = new ConsoleLogger(null);
  const message = 'warn message';
  await l.logWarn(message);
  expect(spies.warn).toHaveBeenCalled();
  expect(spies.warn.mock.calls[0]).toContain(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});

test('ConsoleLogger logError sends error log', async (done) => {
  const l = new ConsoleLogger(null);
  const message = 'error message';
  await l.logError(message);
  expect(spies.error).toHaveBeenCalled();
  expect(spies.error.mock.calls[0]).toContain(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});

test('ConsoleLogger honors log level', async (done) => {
  const l = new ConsoleLogger(null, {logLevel: LOG_LEVELS.LOG_NONE});
  await l.log('message');
  expect(spies.log).toHaveBeenCalledTimes(0);

  l.options.logLevel = LOG_LEVELS.LOG_LOG;
  await l.log('message');
  expect(spies.log).toHaveBeenCalledTimes(1);

  done();
});
