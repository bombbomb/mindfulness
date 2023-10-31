import { MindfulnessOptions, DetailsInterface } from '../interfaces/options';

/**
 * Parent Mindfulness class.
 *
 * Contains some shared functionality used by contrib modules.
 */
export default abstract class Mindfulness<BeforeResult = unknown> {
  options: MindfulnessOptions;

  type: string;

  constructor(options?: MindfulnessOptions) {
    this.options = options || {};
  }

  /**
   * Handle a "before" function.
   *
   * These functions can be used to modify for a specific request. Before functions
   *
   * @param message The message being logged
   * @param payload The payload being logged
   * @param options The settings for this call
   */
  async before(details: DetailsInterface, options?: Partial<MindfulnessOptions>): Promise<BeforeResult> {
    const before = async () => {
      const callOptions = this.getCallOptions(options);

      if (!callOptions.before) {
        return { ...details };
      }

      const args = [];
      switch (this.type) {
        // logger
        case 'logger':

          if (callOptions && callOptions.before) {
            switch (callOptions.before.length) {
              case 3:
                args.push(details.message);
                args.push(details.payload);
                break;

              default:
                args.push({ ...details });
            }
          }

          break;

        // metrics
        default:

          if (callOptions && callOptions.before) {
            // switch based on the number of arguments for this function...
            switch (callOptions.before.length) {
              case 3:
                args.push(details.metricType);
                args.push(details.metric);
                break;

              default:
                args.push({ ...details });
            }
          }

          break;
      }

      args.push(callOptions);

      const result = await callOptions.before.apply(this, args);
      return { ...result };
    };

    return before();
  }

  debug(...args) {
    if (this.options.debug) {
      console.info.call(console, ...args);
    }
  }

  /**
   * Get the options for a specific call.
   *
   * Basically will return an options object for a specific call merged with the logger's
   * default options.
   *
   * @param options Call specific options
   */
  getCallOptions(options?: MindfulnessOptions): MindfulnessOptions {
    // if we have call options, override the defaults or just return the defaults.
    return (options) ? {
      ...this.options,
      ...options,
    } : { ...this.options };
  }

  getEnvironment() {
    if (typeof process.env.ENVIRONMENT !== 'undefined' && process.env.ENVIRONMENT) {
      return process.env.ENVIRONMENT;
    }
    if (typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }
    return 'production';
  }
}
