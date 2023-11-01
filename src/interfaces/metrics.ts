import type { MindfulnessOptions } from './options';

export type MetricInterface = {
  metric: string;
  feature?: string;
  value?: unknown;
}

export type MetricsBeforeResult = {
  metric: MetricInterface;
  options: MindfulnessOptions;
};

export interface M {
  layers: object[];
  before: (metricType: string, metric: MetricInterface) => Promise<MetricsBeforeResult>;
  after: (err: object) => Promise<unknown>;
}

export interface MetricsInterface {
  active: boolean;
  decrement(...args: unknown[]): Promise<unknown>;
  increment(...args: unknown[]): Promise<unknown>;
  timing(...args: unknown[]): Promise<unknown>;
}
