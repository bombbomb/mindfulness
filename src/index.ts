import { ConsoleLogger, ConsoleMetrics } from './contrib/console';
import { NullLogger, NullMetrics } from './contrib/null';
import { JsonPostLogger, JsonPostMetrics } from './contrib/json_post';
import { LoggerOptions, L, LoggerLayer } from './interfaces/logger';
import { M, MetricsOptions, MetricInterface } from './interfaces/metrics';
import Metric from './models/metric';

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

/**
 * Logger class.
 *
 * A logger instance may represent one or more layers of logging. Each
 * layer represents an output (console, POST request, file, etc).
 */
export class Logger implements L {
  errors = [];
  layers = [];
  options: LoggerOptions = {};

  /**
   * Build our logger object.
   *
   * @param layers The logging layers to include.
   */
  constructor(layers: (string|LoggerLayer)[] = [], options = {}) {
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
    });
  }

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
        await this.options.after(results);
      }
      resolve();
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
          const result = await callOptions.before(message, thisPayload, callOptions);
          return resolve({ message: result.message, payload: result.payload, options: callOptions });
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

    // call the log function on each layer
    const promises = this.layers
      .filter(layer => layer.active === true)
      .map(layer => layer[logLevel](
        beforeResult.message,
        beforeResult.payload,
        beforeResult.options,
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
      .catch((err) => {
        this.errors.push(err);
        if (!this.options.alwaysSilent && !this.options.silent) {
          throw err;
        }
        this.options.silent = false;
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
  getCallOptions(options?: LoggerOptions): LoggerOptions {
    // if we have call options, override the defaults or just return the defaults.
    return (options) ? {
      ...this.options,
      ...options,
    } : { ...this.options };
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

export class Metrics implements M {
  errors = [];
  layers = [];
  options: MetricsOptions = {};

  constructor(layers = [], options: MetricsOptions = {}) {
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
  }

  /**
   * Handle any after metrics handlers.
   *
   * @param results Results from metrics handlers.
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
    if (['increment', 'decrement', 'timing'].indexOf(metricType) < 0) {
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

    // call the log function on each layer
    const promises = this.layers.map(layer => layer[metricType](metric, beforeResult.options));

    // return a promise that will resolve when all layers are finished
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then((results) => {
          this.after(results)
            .then(resolve);
        })
        .catch(reject);
    })
      .then(() => {
        this.options.silent = false;
      })
      .catch((err) => {
        this.errors.push(err);
        if (!this.options.silent && !this.options.alwaysSilent) {
          throw err;
        }
        this.options.silent = false;
      });
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
