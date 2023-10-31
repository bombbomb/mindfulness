import { Debugger } from 'debug';
import {
  MetricsBeforeCallback, MetricsAfterCallback, MetricsRequestBodyCallback,
  LoggerBeforeCallback, LoggerAfterCallback, BeforeCallback,
} from './callbacks';

interface JsonReplacer {
  (key: string, value: unknown): unknown;
}

export interface DetailsInterface {
  metricType?: string;
  metric?: { category?: string; metric?: string; };
  [propName: string]: unknown;
}

export type MindfulnessOptions = {
  before?: (MetricsBeforeCallback | LoggerBeforeCallback | BeforeCallback);
  after?: (MetricsAfterCallback | LoggerAfterCallback);
  requestBodyCallback?: MetricsRequestBodyCallback;
  jsonReplacer?: JsonReplacer;
  namespace?: string;
  onError?: VoidFunction;
  console?: Console;
  debugInstance?: Debugger;
  logLevel?: number;
  dataDefaults?: DetailsInterface;
  requestOptionsCallback?: (request: RequestInit, details: DetailsInterface, options: MindfulnessOptions) => RequestInit;
  paths?: Record<string, unknown>;
  [propName: string]: unknown;
}
