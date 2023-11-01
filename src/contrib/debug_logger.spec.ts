import { Debugger } from 'debug';
import { DebugLogger } from './debug';

test('DebugLogger logs to the console', async () => {
  const l = new DebugLogger();
  const message = 'my message';
  const debugInstance = jest.fn();
  await l.log(message, null, { debugInstance: debugInstance as unknown as Debugger });
  expect(debugInstance).toHaveBeenCalled();
});
