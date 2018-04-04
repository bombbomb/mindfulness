import { ConsoleLogger, ConsoleMetrics } from './contrib/console';
import { NullLogger, NullMetrics } from './contrib/null';
import { JsonPostLogger, JsonPostMetrics } from './contrib/json_post';
import { L, LoggerLayer, LOG_LEVELS } from './interfaces/logger';
import { M, MetricInterface } from './interfaces/metrics';
import Metric from './models/metric';
import { MindfulnessOptions } from './interfaces/options';
import RateLimiter from './contrib/rate_limiter';

const contribLoggers = {
  console: ConsoleLogger,
  json_post: JsonPostLogger,
  null: NullLogger,
};

const contribMetrics = {
  console: ConsoleMetrics,
  json_post: JsonPostMetrics,
  null: NullMetrics,
};

class MindfulnessBase {
  options: MindfulnessOptions = {};

  layers = [];
  errors = [];

  activateAllLayers() {
    for (let index = 0; index < this.layers.length; index += 1) {
      this.layers[index].active = true;
    }
    return this;
  }

  /**
   * Handle an "after" function.
   *
   * Runs after all layers have finished.
   *
   * @param results Results from all logging layers
   */
  async after(results: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.options.after) {
        await this.options.after.apply(this, results);
      }
      resolve();
    });
  }

  /**
   * Error handler.
   *
   * Handles general error behavior and will also handle calling
   * an onError handler if one is present.
   *
   * @param error Error
   */
  async errorHandler(error): Promise<any> {
    console.error(`Mindfulness error: ${error}`);
    this.errors.push(error);

    if (!this.options.alwaysSilent && !this.options.silent) {
      throw error;
    }

    this.options.silent = false;

    return new Promise(async (resolve) => {
      if (this.options.onError) {
        await this.options.onError.apply(this, error);
      }

      resolve();
    });
  }

  /**
   * Filter the active layers for one call.
   *
   * @param filter A string or a callback to filter with
   */
  filterLayers(filter: any) {
    let callback = filter;
    if (typeof filter === 'string') {
      callback = layer => layer instanceof contribLoggers[filter];
    }

    this.layers = this.layers.map((layer) => {
      const thisLayer = layer;
      if (typeof layer.active === 'boolean') {
        thisLayer.active = callback(layer);
      }
      return thisLayer;
    });

    return this;
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
}

/**
 * Logger class.
 *
 * A logger instance may represent one or more layers of logging. Each
 * layer represents an output (console, POST request, file, etc).
 */
export class Logger extends MindfulnessBase implements L {
  static LOG_LEVELS = LOG_LEVELS;

  rateLimiter: RateLimiter;

  /**
   * Build our logger object.
   *
   * @param layers The logging layers to include.
   */
  constructor(layers: (string|LoggerLayer)[] = [], options = {}) {
    super();

    this.options = {
      alwaysSilent: true,
      silent: false,
      ...options,
    };

    // default for logging is just to use the console
    let callLayers = layers;
    if (layers.length === 0) {
      callLayers = ['console'];
    }

    // add any layers that may exist
    callLayers.forEach((layer) => {
      let thisLayer = layer;

      // user passed in a string
      if (typeof layer === 'string') {
        if (Object.keys(contribLoggers).indexOf(layer) < 0) {
          throw new Error(`Could not find layer type: ${layer}`);
        }
        thisLayer = new contribLoggers[layer]();
      }
      // this is a LoggerLayer
      else if (typeof layer === 'object' && layer.type && Object.keys(contribLoggers).indexOf(layer.type) >= 0) {
        thisLayer = new contribLoggers[layer.type](layer);
      }

      if (typeof thisLayer === 'object') {
        thisLayer.active = true;
      }

      this.layers.push(thisLayer);

      if (this.options.rateLimit) {
        this.rateLimiter = new RateLimiter();
      }
    });
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
  async before(message: any, payload?: object, options?: object): Promise<any> {
    const before = async () => (
      new Promise(async (resolve, reject) => {
        const callOptions = this.getCallOptions(options);

        // make sure we're not passing a reference if we don't need to...
        const thisPayload = payload;

        if (callOptions && callOptions.before) {
          const args = [];

          switch (callOptions.before.length) {
            case 3:
              args.push(message);
              args.push(payload);
              break;

            default:
              args.push({ message, payload });
          }

          args.push(callOptions);

          const result = await callOptions.before.apply(this, args);
          return resolve({ ...result });
        }

        return resolve({ message, payload: thisPayload, options: callOptions });
      })
    );

    return before();
  }

  /**
   * Used to log messages.
   *
   * Dynamically bound to the various methods in the constructor.
   *
   * @param logLevel Log level to use for this message
   * @param message The message
   * @param payload optional payload object
   */
  async call(logLevel: string, message: any, payload?: any, options?: object) {
    // call & wait for our before handlers
    const beforeResult = await this.before(message, payload, options);

    const newOptions = beforeResult.options;
    delete newOptions.before;

    const details = { logLevel, ...beforeResult };

    if (this.rateLimiter && !this.rateLimiter.allowed(details, newOptions)) {
      return Promise.resolve();
    }

    // call the log function on each layer
    const promises = this.layers
      .filter(layer => layer.active === true)
      .map(layer => layer[logLevel](
        beforeResult.message,
        beforeResult.payload,
        newOptions,
      ));

    // return a promise that will resolve when all layers are finished
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then((results) => {
          this
            .activateAllLayers()
            .after(results)
            .then(resolve);
        })
        .catch((err) => {
          this.activateAllLayers();
          reject(err);
        });
    })
      .then(() => {
        this.options.silent = false;
      })
      .catch(this.errorHandler.bind(this));
  }

  /**
   * Log a message to the "log" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  log(message: any, payload?: any, options?: object) {
    return this.call('log', message, payload, options);
  }

  /**
   * Log a message to the "error" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  logError(message: any, payload?: any, options?: object) {
    return this.call('logError', message, payload, options);
  }

  /**
   * Log a message to the "info" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  logInfo(message: any, payload?: any, options?: object) {
    return this.call('logInfo', message, payload, options);
  }

  /**
   * Log a message to the "warn" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  logWarn(message: any, payload?: any, options?: object) {
    return this.call('logWarn', message, payload, options);
  }

  /**
   * Alias for logWarn
   */
  logWarning(message: any, payload?: any, options?: object) {
    return this.logWarn(message, payload, options);
  }

  silent() {
    this.options.silent = true;
    return this;
  }
}

/**
 * Metrics sending class
 *
 * Send metrics to a metrics server via console or JSON POST.
 */
export class Metrics extends MindfulnessBase implements M {

  rateLimiter: RateLimiter;

  constructor(layers = [], options: MindfulnessOptions = {}) {
    super();
    this.options = {
      alwaysSilent: false,
      silent: false,
      ...options,
    };

    // default for logging is just to use the console
    let callLayers = layers;
    if (layers.length === 0) {
      callLayers = ['console'];
    }

    // add any layers that may exist
    callLayers.forEach((layer) => {
      // user passed in a string
      if (typeof layer === 'string') {
        if (Object.keys(contribMetrics).indexOf(layer) < 0) {
          throw new Error(`Could not find layer type: ${layer}`);
        }
        this.layers.push(new contribMetrics[layer]());
        return;
      }

      // this is a MetricLayer
      if (layer.type && Object.keys(contribMetrics).indexOf(layer.type) >= 0) {
        this.layers.push(new contribMetrics[layer.type](layer));
        return;
      }

      this.layers.push(layer);
    });

    if (this.options.rateLimit) {
      this.rateLimiter = new RateLimiter();
    }
  }

  /**
   * Process any before handlers.
   *
   * @param metricType The metric type being called
   * @param metric The Metric object
   * @param options Current options for this call.
   */
  async before(metricType: string, metric: MetricInterface, options?: MindfulnessOptions): Promise<any> {
    const before = async () => (
      new Promise(async (resolve, reject) => {
        if (options.before) {
          const result = await options.before.apply(this, [metricType, metric, options]);
          return resolve({ metric: result.metric, options: result.options });
        }

        return resolve({ metric, options });
      })
    );

    return before();
  }

  /**
   * Handle increment calls.
   *
   * This will handle the before & after functionality and pass this
   * on to each metric layer as needed.
   *
   * @param metricType The metric type being called
   * @param args Args
   */
  async call(metricType: string, ...args: any[]): Promise<any> {
    if (['increment', 'timing'].indexOf(metricType) < 0) {
      return Promise.reject(new Error(`Invalid metric type: ${metricType}`));
    }

    const { length } = args;

    let { options } = this;
    if (length <= 0) {
      throw new Error(`Invalid arguments for ${metricType}`);
    }
    else if (length === 2 && args[0] instanceof Metric && typeof args[1] === 'object') {
      options = {
        ...this.options,
        ...args[1],
      };
    }

    const metric = new Metric(...args);

    if (metricType === 'timing' && !metric.value) {
      return Promise.reject(new Error('No value specified for a timing metric'));
    }

    // call & wait for our before handlers
    const beforeResult = await this.before(metricType, metric, options);

    const newOptions = beforeResult.options;
    delete newOptions.before;

    if (this.rateLimiter && !this.rateLimiter.allowed(beforeResult, newOptions)) {
      return Promise.resolve();
    }

    // call the log function on each layer
    const promises = this.layers.map(layer => layer[metricType](metric, newOptions));

    // return a promise that will resolve when all layers are finished
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(this.after.bind(this))
        .then(resolve)
        .catch(reject);
    })
      .then(() => {
        this.options.silent = false;
      })
      .catch(this.errorHandler.bind(this));
  }

  async decrement(...args: any[]) {
    return this.call('decrement', ...args);
  }

  async increment(...args: any[]): Promise<any> {
    return this.call('increment', ...args);
  }

  async timing(...args: any[]): Promise<any> {
    return this.call('timing', ...args);
  }

  silent() {
    this.options.silent = true;
    return this;
  }
}
