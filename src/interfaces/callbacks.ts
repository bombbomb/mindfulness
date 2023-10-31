import { MindfulnessOptions, DetailsInterface } from './options';
import { MetricInterface } from './metrics';
import { LoggerBeforeResult } from './logger';

export interface BeforeCallback {
  (details: DetailsInterface, options: MindfulnessOptions): Promise<DetailsInterface>;
}

export interface MetricsBeforeCallback {
  (metricType: string, metric: MetricInterface, options: MindfulnessOptions): Promise<unknown>;
}

export interface MetricsAfterCallback {
  (results: object): void;
}

export interface MetricsRequestBodyCallback {
  (body: object, details: object): Record<string, unknown>;
}

export interface LoggerBeforeCallback {
  (message: string, payload?: unknown, options?: MindfulnessOptions): Promise<LoggerBeforeResult>;
}

export interface LoggerAfterCallback {
  (results: object): void;
}
