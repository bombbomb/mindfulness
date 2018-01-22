import { Metrics } from "../src/index";

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

test('Metrics logs to console.info by default', async () => {
  const m = new Metrics();
  await m.increment('metric');

  expect(spies.info).toHaveBeenCalled();
});
