import { LOG_LEVELS } from '../src/interfaces/logger';
import getLogLevelConstant from '../src/util/logging';

test('getLogLevelConstant', () => {
  expect(getLogLevelConstant('log')).toBe(LOG_LEVELS.LOG_LOG);
  expect(getLogLevelConstant('info')).toBe(LOG_LEVELS.LOG_INFO);
});
