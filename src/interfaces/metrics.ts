import Metric from '../models/metric';

export interface MetricInterface {
  metric: string,
  feature?: string,
  value?: any,
}

export interface M {
  layers: object[];
  before: (metricType: string, metric: MetricInterface) => Promise<{ metric: MetricInterface, options: object }>;
  after: (err: object) => Promise<any>;
}

export interface MetricsInterface {
  increment(...args: any[]): Promise<any>;
  timing(...args: any[]): Promise<any>;
}
