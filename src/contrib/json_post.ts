// import request from 'request-promise-native';
import get from 'lodash.get';
import { LoggerInterface, LOG_LEVELS, L } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import getLogLevelConstant from '../util/logging';
import { MetricsInterface, M } from '../interfaces/metrics';
import { MindfulnessOptions, DetailsInterface } from '../interfaces/options';
import Metric from '../models/metric';
import getMindfulnessVersion from '../util/version';
import Mindfulness from './mindfulness';

// need to use require() syntax because this package does not define default...
const request = require('request-promise-native');

export class JsonPostHandler {
  parentObject: Mindfulness;
  version: string;

  constructor(parent: Mindfulness) {
    this.parentObject = parent;
  }

  async buildBody(details: object, options: MindfulnessOptions): Promise<object> {
    const body = {};

    if (!this.version) {
      this.version = await getMindfulnessVersion();
    }

    if (options.messageTemplate) {
      const keys = Object.keys(options.messageTemplate);

      const variables = {
        $environment: this.parentObject.getEnvironment(),
        $version: this.version,
        ...details,
      };
      console.info({variables});

      for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        const value = options.messageTemplate[key];

        // optional item
        if (/\?$/.test(key)) {
          const keyName = key.replace(/\?$/, '');
          if (Array.isArray(value)) {
            if (typeof variables[value[0]] !== 'undefined') {
              body[keyName] = variables[value[0]];
            }
            else {
              [, body[keyName]] = value;
            }
          }
          else if (typeof variables[value] !== 'undefined') {
            body[keyName] = variables[value];
          }
          else if (get(details, value)) {
            body[keyName] = get(details, value);
          }
        }
        else if (value in variables) {
          body[key] = variables[value];
        }
        else if (get(details, value)) {
          body[key] = get(details, value);
        }
      }
    }

    return Promise.resolve(body);
  }

  /**
   * Build the request body and hand off to a requestBodyCallback if specified.
   *
   * @param level Log level string
   * @param message Message being logged
   * @param payload Current payload
   * @param options Call-specific options
   */
  async getRequestBody(details: DetailsInterface, options: MindfulnessOptions = {}): Promise<object> {
    const dataDefaults = (options.dataDefaults) ? options.dataDefaults : {};
    const builtBody = await this.buildBody(details, options);
    let body = {
      ...builtBody,
      ...dataDefaults,
    };

    if (options.requestBodyCallback) {
      body = options.requestBodyCallback(body, {
        ...details,
        options,
      });
    }

    return body;
  }

  /**
   * Get the request() options.
   *
   * @param callRequest The current request() options
   * @param metricType The metric type being called
   * @param metric The metric being updated
   * @param options Call-specific options.
   */
  async getRequestOptions(callRequest: object, details: DetailsInterface, options: MindfulnessOptions): Promise<object> {
    let thisCallRequest = callRequest;

    if (options.requestOptionsCallback) {
      const result = options.requestOptionsCallback(thisCallRequest, details, options);
      if (result && typeof result === 'object') {
        thisCallRequest = result;
      }
      else {
        console.warn(`The results of Metrics.requestOptionsCallback did not return a correct value. Ignoring result with type: ${typeof result}`);
      }
    }

    const thisRequest: { method: string, uri: string, body: (string | object), json?: boolean } = {
      ...thisCallRequest,
      method: 'POST',
      uri: this.getRequestUri(details, options),
      body: await this.getRequestBody(details, options),
    };

    if (typeof thisRequest.body === 'object') {
      thisRequest.json = true;
    }

    return Promise.resolve(thisRequest);
  }

  /**
   * Get the request path.
   *
   * @param metricType The metric type being sent
   * @param options An object of options for this call.
   */
  getRequestPath(details: DetailsInterface, options: MindfulnessOptions) {
    if (typeof details.metricType !== 'undefined') {
      if (typeof options.paths !== 'undefined' && typeof options.paths[details.metricType] !== 'undefined') {
        return options.paths[details.metricType];
      }
    }
    return (options.path) ? String(options.path) : '/';
  }

  getRequestScheme(options) {
    let scheme = (options.scheme) ? options.scheme : 'http';

    // check the host to see if it has http/https in it...
    const host = /^(https?):\/\//.exec(options.host);
    if (host) {
      [, scheme] = host;
    }

    return scheme;
  }

  /**
   * Get the request URI based on options.
   */
  getRequestUri(details: DetailsInterface, options?: MindfulnessOptions): string {
    const callOptions = this.parentObject.getCallOptions(options);
    let url = '';

    const scheme = this.getRequestScheme(callOptions);
    let host = (callOptions.host) ? String(callOptions.host).replace(/^https?:\/\//, '') : 'localhost';
    const port = (callOptions.port) ? Number(callOptions.port) : null;
    let path = this.getRequestPath(details, options);

    if (host.slice(-1) === '/') {
      host = host.slice(0, -1);
    }

    if (path[0] !== '/') {
      path = `/${path}`;
    }

    url = `${scheme}://${host}`;
    if (port) {
      url += `:${port}`;
    }

    url += path;

    /* eslint-disable prefer-template */
    if (typeof details.level !== 'undefined') {
      url = url.replace(/\$level(\/)?/, details.level + '$1');
    }
    if (typeof details.metric !== 'undefined') {
      const category = (details.metric.category) ? details.metric.category + '$1' : '';
      url = url.replace(/\$category(\/)?/, category);
      url = url.replace(/\$metric(\/)?/, details.metric.metric + '$1');
    }
    /* eslint-enable prefer-template */

    return url;
  }

  async post(details: object, options: MindfulnessOptions): Promise<any> {
    if (!this.version) {
      this.version = await getMindfulnessVersion();
    }

    const requestOptions: object = await this.getRequestOptions({
      json: true,
      resolveWithFullResponse: true,
      headers: {
        'User-Agent': `mindfulness/${this.version}`,
      },
    }, details, options);

    this.parentObject.debug('mindfulness logging', { requestOptions });
    return request(requestOptions);
  }
}

/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
export class JsonPostLogger extends ContribLogger implements LoggerInterface {
  json: JsonPostHandler;

  constructor(options?: MindfulnessOptions) {
    super({
      messageTemplate: {
        message: 'message',
        'info?': ['payload', {}],
        environment: '$environment',
        severity: 'level',
        type: 'level',
      },
      ...options,
    });

    this.json = new JsonPostHandler(this);
  }

  /**
   * Send the POST request.
   *
   * @param level Log level as a lowercase string
   * @param message The log message
   * @param payload The payload to include
   * @param options Call-specific options
   */
  async call(level: string, message: any, payload?: any, options?: MindfulnessOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions = this.getCallOptions(options);

      // call & wait for our before handlers
      const beforeResult = await this.before({ message, payload }, callOptions);

      if (callOptions.logLevel !== LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
        const thisMessage = this.getMessage(beforeResult.message);
        const thisPayload = this.getPayload(beforeResult.payload);
        try {
          const response = await this.json.post({ level, message: thisMessage, payload: thisPayload }, callOptions);
          resolve(response);
        }
        catch (e) {
          this.debug('mindfulness logging error', e);
          reject(e);
        }
      }
      else {
        resolve();
      }
    });
  }

  getMessage(message) {
    if (typeof message === 'string') {
      return message;
    }

    if (typeof message === 'object' && message instanceof Error) {
      return message.message;
    }

    return JSON.stringify(message);
  }

  getPayload(payload) {
    if (typeof payload === 'object') {
      if (payload instanceof Error) {
        return {
          message: payload.message,
          stack: payload.stack,
        };
      }
      return { ...payload };
    }

    return payload;
  }
}

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
  async call(metricType: string, metric: Metric, options?: MindfulnessOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions = this.getCallOptions(options);

      // call & wait for our before handlers
      const beforeResult = await this.before({ metricType, metric }, callOptions);

      try {
        const response = await this.json.post({ metricType: beforeResult.metricType, metric: beforeResult.metric }, callOptions);
        resolve(response);
      }
      catch (e) {
        this.debug('mindfulness metrics error', e);
        reject(e);
      }
    });
  }

  debug(...args) {
    if (this.options.debug) {
      console.info.call(console, ...args);
    }
  }

  /**
   * Used to create the list of arguments each metric function uses
   *
   * @param args Arguments array
   */
  settleArguments(...args: any[]): {args: any[], metric: Metric, options: object} {
    const m = new Metric(...args);
    let { options } = this;

    // in cases where the first argument is a Metric object and the second one is an object,
    // we'll assume that it we're getting: (metric, options)
    if (args.length === 2 && args[0] instanceof Metric && typeof args[1] === 'object') {
      [, options] = args;
    }

    return {
      args,
      metric: m,
      options,
    };
  }

  async increment(...args: any[]): Promise<any> {
    const { args: callArgs, metric, options } = this.settleArguments(...args);
    return this.call('increment', metric, options);
  }

  async timing(...args: any[]): Promise<any> {
    const { args: callArgs, metric, options } = this.settleArguments(...args);
    return this.call('timing', metric, options);
  }
}
