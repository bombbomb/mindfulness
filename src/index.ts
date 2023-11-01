import { contribLoggers, contribMetrics } from './contrib';
import {
 L, LoggerLayer, LOG_LEVELS, LoggerInterface, LoggerBeforeResult,
} from './interfaces/logger';
import { M, MetricInterface, MetricsInterface } from './interfaces/metrics';
import Metric from './models/metric';
import { MindfulnessOptions } from './interfaces/options';
import { MetricsRequestBodyCallback } from './interfaces/callbacks';

type FilterFunction = (layer: unknown) => boolean;

type MetricLayer = {
  type: 'console' | 'json_post' | 'null';
  host?: string;
  debug?: boolean;
  before?: (metricType: string, metric: MetricInterface, options: MindfulnessOptions) => Promise<unknown>;
  jsonReplacer?(key: string, value: unknown): unknown;
  requestBodyCallback?: MetricsRequestBodyCallback;
  dataDefaults?: MindfulnessOptions['dataDefaults'];
  paths?: MindfulnessOptions['paths'];
 }

/**
 * Base mindfulness class used for Logger and Metrics.
 */
abstract class MindfulnessBase {
  options: MindfulnessOptions = {};

  layers: (LoggerInterface|MetricsInterface)[] = [];

  errors = [];

  /**
   * Make sure all layers are active.
   */
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
  async after(results: unknown): Promise<void> {
    return new Promise((resolve) => {
      if (this.options.after) {
        this.options.after.apply(this, results).then(resolve);
      }
      else {
        resolve();
      }
    });
  }

  /**
   * Deactivate all layers.
   */
  deactivateAllLayers() {
    for (let index = 0; index < this.layers.length; index += 1) {
      this.layers[index].active = false;
    }
    return this;
  }

  /**
   * Error handler.
   *
   * Handles general error behavior and will also handle calling
   * an onError handler if one is present.
   *
   * @param error Error
   */
  async errorHandler(error): Promise<unknown> {
    if (!this.options.silent) {
      console.error(`Mindfulness error: ${error}`);
    }
    this.errors.push(error);

    if (!this.options.alwaysSilent && !this.options.silent) {
      console.warn('reject');
      throw error;
    }

    this.options.silent = false;
    if (this.options.onError) {
      await this.options.onError.apply(this, error);
    }
    return error;
  }

  /**
   * Filter the active layers for one call.
   *
   * @param filter A string or a callback to filter with
   */
  filterLayers(filter: string | FilterFunction) {
    let callback = filter;
    if (typeof filter === 'string') {
      callback = (layer) => layer instanceof contribLoggers[filter];
    }

    this.layers = this.layers.map((layer) => {
      const thisLayer = layer;
      if (typeof layer.active === 'boolean' && typeof callback === 'function') {
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

  /**
   * Build our logger object.
   *
   * @param layers The logging layers to include.
   */
  constructor(layers: (keyof typeof contribLoggers|LoggerLayer)[] = [], options = {}) {
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

    const contribLoggerKeys = Object.keys(contribLoggers);

    // add any layers that may exist
    callLayers.forEach((layer) => {
      let thisLayer: LoggerInterface|null = null;

      // user passed in a string
      if (typeof layer === 'string') {
        if (!contribLoggerKeys.includes(layer)) {
          throw new Error(`Could not find layer type: ${layer}`);
        }
        thisLayer = new contribLoggers[layer]() as unknown as LoggerInterface;
      }
      // this is a LoggerLayer
      else if (typeof layer === 'object' && layer.type) {
        if (!contribLoggerKeys.includes(layer.type)) {
          throw new Error(`Could not find layer type: ${layer}`);
        }
        thisLayer = new contribLoggers[layer.type](layer);
      }

      if (thisLayer) {
        thisLayer.active = true;
      }

      if (thisLayer) {
        this.layers.push(thisLayer);
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
  async before(message: unknown, payload?: unknown, options?: MindfulnessOptions): Promise<LoggerBeforeResult> {
    const before = async () => {
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
        return result;
      }

      return { message, payload: thisPayload, options: callOptions };
    };

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
   * @param options optional options
   */
  async call(logLevel: string, message: unknown, payload?: unknown, options?: Partial<MindfulnessOptions>) {
    // call & wait for our before handlers
    const beforeResult = await this.before(message, payload, options);

    const newOptions = typeof beforeResult === 'object' && 'options' in beforeResult ? beforeResult.options : options;
    delete newOptions.before;

    // call the log function on each layer
    const promises = this.layers
      .filter((layer) => layer.active === true)
      .map((layer) => layer[logLevel](
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
  log(message: unknown, payload?: unknown, options?: object) {
    return this.call('log', message, payload, options);
  }

  /**
   * Log a message to the "error" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  logError(message: unknown, payload?: unknown, options?: object) {
    return this.call('logError', message, payload, options);
  }

  /**
   * Log a message to the "info" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  logInfo(message: unknown, payload?: unknown, options?: object) {
    return this.call('logInfo', message, payload, options);
  }

  /**
   * Log a message to the "warn" channel.
   *
   * @param message Message to log
   * @param payload Option payload to include
   */
  logWarn(message: unknown, payload?: unknown, options?: object) {
    return this.call('logWarn', message, payload, options);
  }

  /**
   * Alias for logWarn
   */
  logWarning(message: unknown, payload?: unknown, options?: object) {
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
  layers: MetricsInterface[] = [];

  /**
   * Constructor.
   *
   * @param layers Metrics handler layers
   * @param options Options for this metrics object.
   */
  constructor(layers: (keyof typeof contribMetrics|MetricLayer)[] = [], options: MindfulnessOptions = {}) {
    super();
    this.options = {
      alwaysSilent: true,
      silent: false,
      ...options,
    };

    // default for metrics is just to use the console
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
        this.layers.push(new contribMetrics[layer]() as unknown as MetricsInterface);
        return;
      }

      // this is a MetricLayer
      if (layer.type && Object.keys(contribMetrics).indexOf(layer.type) >= 0) {
        this.layers.push(new contribMetrics[layer.type](layer) as unknown as MetricsInterface);
      }
    });
  }

  /**
   * Process any before handlers.
   *
   * @param metricType The metric type being called
   * @param metric The Metric object
   * @param options Current options for this call.
   */
  async before(metricType: string, metric: MetricInterface, options?: MindfulnessOptions): Promise<{ metric: MetricInterface, options: MindfulnessOptions }> {
    const before = async (): Promise<{ metric: MetricInterface, options: MindfulnessOptions }> => {
      if (options.before) {
        const result = await options.before.apply(this, [metricType, metric, options]);
        return { metric: result.metric, options: result.options };
      }

      return { metric, options };
    };
    return before();
  }

  /**
   * Handle increment calls.
   *
   * This will handle the before & after functionality and pass this
   * on to each metric layer as needed.
   *
   * @param callType The metric type being called
   * @param args Args
   */
  async call<CallType extends Exclude<keyof MetricsInterface, 'active'>>(callType: CallType, ...args: unknown[]): Promise<Awaited<ReturnType<MetricsInterface[CallType]>>[]> {
    let { options } = this;
    if (args.length <= 0) {
      throw new Error(`Invalid arguments for ${callType}`);
    }
    else if (args.length === 2 && args[0] instanceof Metric && typeof args[1] === 'object') {
      options = {
        ...this.options,
        ...args[1],
      };
    }

    const metric = new Metric(...args);

    // fail timing metrics without values
    if (callType === 'timing' && !metric.value) {
      throw new Error('No value specified for a timing metric');
    }

    // call & wait for our before handlers
    const beforeResult = await this.before(callType, metric, options);

    const newOptions = beforeResult.options;
    delete newOptions.before;

    try {
      // call the given `metricType` method on the metric layer
      const promises = this.layers
        .map((layer) => (layer[callType])(metric, newOptions));
      const all = await Promise.all(promises);
      await this.after(all);
      return all as Awaited<ReturnType<MetricsInterface[CallType]>>[];
    }
    catch (error) {
      await this.errorHandler(error);
    }
    finally {
      this.options.silent = false;
    }
    return [];
  }

  async decrement(...args: unknown[]) {
    return this.call('decrement', ...args);
  }

  async increment(...args: unknown[]): Promise<unknown> {
    return this.call('increment', ...args);
  }

  async timing(...args: unknown[]): Promise<unknown> {
    return this.call('timing', ...args);
  }

  silent() {
    this.options.silent = true;
    return this;
  }
}
