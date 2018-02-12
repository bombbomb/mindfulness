import { NullLogger } from '../src/contrib/null';
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

test('NullLoger does not log to console', async (done) => {
  const l = new NullLogger();
  const message = 'my message';
  await l.log(message);
  expect(spies.log).toHaveBeenCalledTimes(0);
  done();
});
