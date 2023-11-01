import { LOG_LEVELS } from '../interfaces/logger';
import getLogLevelConstant from './logging';

test('getLogLevelConstant', () => {
  expect(getLogLevelConstant('log')).toBe(LOG_LEVELS.LOG_LOG);
  expect(getLogLevelConstant('info')).toBe(LOG_LEVELS.LOG_INFO);
});
