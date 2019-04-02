import { DebugLogger } from '../src/contrib/debug';

test('ConsoleLogger logs to the console', async (done) => {
  const l = new DebugLogger();
  const message = 'my message';
  const debugInstance = jest.fn();
  await l.log(message, null, { debugInstance });
  expect(debugInstance).toHaveBeenCalled();
  done();
});
