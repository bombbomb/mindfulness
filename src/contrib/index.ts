import { ConsoleLogger, ConsoleMetrics } from './console';
import { NullLogger, NullMetrics } from './null';
import { JsonPostMetrics } from './JsonPostMetrics';
import { JsonPostLogger } from './JsonPostLogger';
import { DebugLogger } from './debug';

export const contribLoggers = {
  console: ConsoleLogger,
  json_post: JsonPostLogger,
  null: NullLogger,
  debug: DebugLogger,
} as const;

export const contribMetrics = {
  console: ConsoleMetrics,
  json_post: JsonPostMetrics,
  null: NullMetrics,
} as const;
