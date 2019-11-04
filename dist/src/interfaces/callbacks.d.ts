import { MindfulnessOptions, DetailsInterface } from './options';
import { MetricInterface } from './metrics';
export interface BeforeCallback {
    (details: DetailsInterface, options: MindfulnessOptions): Promise<DetailsInterface>;
}
export interface MetricsBeforeCallback {
    (metricType: string, metric: MetricInterface, options: MindfulnessOptions): Promise<any>;
}
export interface MetricsAfterCallback {
    (results: object): void;
}
export interface MetricsRequestBodyCallback {
    (body: object, details: object): object;
}
export interface LoggerBeforeCallback {
    (message: string, payload?: any, options?: MindfulnessOptions): Promise<{
        message: string;
        payload: any;
        options: object;
    }>;
}
export interface LoggerAfterCallback {
    (results: object): void;
}
