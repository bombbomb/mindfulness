import type { MindfulnessOptions } from './options';
import { contribLoggers } from '../contrib';

export interface LoggerInterface {
  active: boolean;
  log(message: unknown, payload?: unknown, options?: object): Promise<unknown>
  logError(message: unknown, payload?: unknown, options?: object): Promise<unknown>
  logInfo(message: unknown, payload?: unknown, options?: object): Promise<unknown>
  logWarn(message: unknown, payload?: unknown, options?: object): Promise<unknown>
}

export type LoggerBeforeResult = {
  message: string;
  payload: unknown;
  options: MindfulnessOptions;
}

export const LOG_LEVELS = {
  LOG_NONE: 0,
  LOG_LOG: 1,
  LOG_ERROR: 2,
  LOG_WARN: 4,
  LOG_INFO: 8,
  LOG_ALL: 1 | 2 | 4 | 8,
};

export interface LoggerLayer {
  type: keyof typeof contribLoggers;
  handler?: LoggerInterface;
  logLevel?: number;
  [propName: string]: unknown;
}

export interface L {
  layers: object[];
  before: (message: string, payload?: unknown, options?: MindfulnessOptions) => Promise<LoggerBeforeResult>;
  after: (err: object) => Promise<unknown>;
}
