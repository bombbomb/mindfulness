/* eslint-disable lines-between-class-members */
import ContribMetrics from './contrib_metrics';
import { MetricsInterface } from '../interfaces/metrics';
import { MindfulnessOptions } from '../interfaces/options';
import Metric from '../models/metric';
import { ResponseError } from '../errors/ResponseError';
import { JsonPostHandler } from './JsonPostHandler';

/**
 * JSON POST metrics
 *
 * Passes off a metrics request to a remote endpoint.
 */

export class JsonPostMetrics extends ContribMetrics implements MetricsInterface {
  json: JsonPostHandler;

  constructor(options?: MindfulnessOptions) {
    super({
      messageTemplate: {
        type: 'metricType',
        environment: '$environment',
        'value?': 'metric.value',
      },
      ...options,
    });

    this.json = new JsonPostHandler(this);
  }

  /**
   * Send the POST request.
   *
   * @param metricType The metric update being made (increment, decrement, timing)
   * @param metric The metric being updated
   * @param options Call-specific options
   */
  async call<CallType extends Exclude<keyof MetricsInterface, 'active'>>(metricType: CallType, metric: Metric, options?: MindfulnessOptions): Promise<Response | null> {
    const callOptions = this.getCallOptions(options);

    // call & wait for our before handlers
    const beforeResult = await this.before({ metricType, metric }, callOptions);

    try {
      const resultMetricType = 'metricType' in beforeResult && typeof beforeResult.metricType === 'string'
        ? beforeResult.metricType
        : metricType;
      const response = await this.json.post({ metricType: resultMetricType, metric: beforeResult.metric }, callOptions);
      if (!response.ok) {
        throw new ResponseError('Error from post', response);
      }
      return response;
    }
    catch (e) {
      this.debug('mindfulness metrics error', e);
      throw e;
    }
  }

  debug(...args: unknown[]) {
    if (this.options.debug) {
      console.info.call(console, ...args);
    }
  }

  async decrement(metricOrCategory: string, subMetric: string, value: unknown, options?: Partial<MindfulnessOptions>);
  async decrement(metricOrCategory: string, subMetric: string, options?: Partial<MindfulnessOptions>);
  async decrement(metricOrCategory: string, value: unknown, options?: Partial<MindfulnessOptions>);
  async decrement(metricOrCategory: Metric | string, subMetric = null, value: unknown = 1, options: Partial<MindfulnessOptions> = {}): Promise<unknown> {
    const thisMetric = metricOrCategory instanceof Metric ? metricOrCategory : new Metric(metricOrCategory, subMetric, value);
    return this.call('decrement', thisMetric, options);
  }

  async increment(metricOrCategory: string, subMetric: string, value: unknown, options?: Partial<MindfulnessOptions>);
  async increment(metricOrCategory: string, subMetric: string, options?: Partial<MindfulnessOptions>);
  async increment(metricOrCategory: string, value: unknown, options?: Partial<MindfulnessOptions>);
  async increment(metricOrCategory: Metric | string, subMetric = null, value: unknown = 1, options: Partial<MindfulnessOptions> = {}): Promise<unknown> {
    const thisMetric = metricOrCategory instanceof Metric ? metricOrCategory : new Metric(metricOrCategory, subMetric, value);
    return this.call('increment', thisMetric, options);
  }

  async timing(metricOrCategory: string, subMetric: string, value: unknown, options?: Partial<MindfulnessOptions>);
  async timing(metricOrCategory: string, subMetric: string, options?: Partial<MindfulnessOptions>);
  async timing(metricOrCategory: string, value: unknown, options?: Partial<MindfulnessOptions>);
  async timing(metricOrCategory: Metric | string, subMetric = null, value: unknown = 1, options: Partial<MindfulnessOptions> = {}): Promise<unknown> {
    const thisMetric = metricOrCategory instanceof Metric ? metricOrCategory : new Metric(metricOrCategory, subMetric, value);
    return this.call('timing', thisMetric, options);
  }
}
