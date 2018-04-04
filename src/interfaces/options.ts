import {
  MetricsBeforeCallback, MetricsAfterCallback, MetricsRequestBodyCallback,
  LoggerBeforeCallback, LoggerAfterCallback, BeforeCallback,
} from './callbacks';

interface JsonReplacer {
  (key: string, value: any): any;
}

export interface MindfulnessOptions {
  before?: (MetricsBeforeCallback | LoggerBeforeCallback | BeforeCallback);
  after?: (MetricsAfterCallback | LoggerAfterCallback);
  requestBodyCallback?: MetricsRequestBodyCallback;
  jsonReplacer?: JsonReplacer;
  [propName: string]: any;
}

export interface DetailsInterface {
  [propName: string]: any;
}
