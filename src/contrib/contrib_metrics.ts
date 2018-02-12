import { MetricsOptions, M, MetricInterface } from '../interfaces/metrics';

export default class ContribMetrics {
  options: MetricsOptions;

  constructor(options?: MetricsOptions) {
    this.options = { ...options };
  }

  /**
   * Process any before handlers.
   *
   * @param metricType The metric type being called
   * @param metric The Metric object
   * @param options Current options for this call.
   */
  async before(metricType: string, metric: MetricInterface, options?: MetricsOptions): Promise<any> {
    const before = async () => (
      new Promise(async (resolve, reject) => {
        if (options.before) {
          const result = await options.before.apply(this, [metricType, metric, options]);

          if (typeof result.metric === 'undefined') {
            const keys = Object.keys(result).join(', ');
            throw new Error(`The before callback must include the metric object. Received: ${keys}`);
          }
          if (typeof result.options === 'undefined') {
            const keys = Object.keys(result).join(', ');
            throw new Error(`The before callback must include the options object. Received: ${keys}`);
          }

          return resolve({ metricType, metric: result.metric, options: result.options });
        }

        return resolve({ metricType, metric, options });
      })
    );

    return before();
  }

  /**
   * Get the options for a specific call.
   *
   * Basically will return an options object for a specific call merged with the logger's
   * default options.
   *
   * @param options Call specific options
   */
  getCallOptions(options?: MetricsOptions): MetricsOptions {
    // if we have call options, override the defaults or just return the defaults.
    return (options) ? {
      ...this.options,
      ...options,
    } : { ...this.options };
  }
}
