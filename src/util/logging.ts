import {LOG_LEVELS} from '../interfaces/logger';

/**
 * Get the LOG_LEVELS constant for a given log level.
 *
 * @param level The level as a lowercase string (e.g., 'log', 'warn').
 */
export function getLogLevelConstant(level: string): number {
  const levelName = 'LOG_' + level.toUpperCase();
  return LOG_LEVELS[levelName];
}
