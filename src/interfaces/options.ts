import {
  MetricsBeforeCallback, MetricsAfterCallback, MetricsRequestBodyCallback,
  LoggerBeforeCallback, LoggerAfterCallback, BeforeCallback,
} from './callbacks';

export interface MindfulnessOptions {
  before?: (MetricsBeforeCallback | LoggerBeforeCallback | BeforeCallback);
  after?: (MetricsAfterCallback | LoggerAfterCallback);
  requestBodyCallback?: MetricsRequestBodyCallback;
  [propName: string]: any;
}

export interface DetailsInterface {
  [propName: string]: any;
}

export interface LoggerOptions {
  type?: string;
  logLevel?: number;
  before?: BeforeCallback;
  after?: LoggerAfterCallback;
  [propName: string]: any;
}

export interface MetricsOptions {
  before?: BeforeCallback;
  after?: MetricsAfterCallback;
  requestBodyCallback?: MetricsRequestBodyCallback;
  [propName: string]: any;
}
