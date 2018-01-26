import { MetricsOptions, M } from '../interfaces/metrics';

export default class ContribMetrics {
  options: MetricsOptions;

  constructor(options?: MetricsOptions) {
    this.options = { ...options };
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
