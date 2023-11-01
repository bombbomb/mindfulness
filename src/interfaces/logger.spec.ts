import { LOG_LEVELS } from './logger';

test('LOG_LEVELS.LOG_ALL contains all types', () => {
  expect(LOG_LEVELS.LOG_ALL & LOG_LEVELS.LOG_LOG).toBeGreaterThan(0);
  expect(LOG_LEVELS.LOG_ALL & LOG_LEVELS.LOG_INFO).toBeGreaterThan(0);
  expect(LOG_LEVELS.LOG_ALL & LOG_LEVELS.LOG_WARN).toBeGreaterThan(0);
  expect(LOG_LEVELS.LOG_ALL & LOG_LEVELS.LOG_ERROR).toBeGreaterThan(0);
});
