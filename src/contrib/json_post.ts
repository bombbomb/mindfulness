// import request from 'request-promise-native';
import { LoggerInterface, LOG_LEVELS, LoggerOptions, L } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import ContribMetrics from './contrib_metrics';
import getLogLevelConstant from '../util/logging';
import { MetricsInterface, MetricsOptions, M } from '../interfaces/metrics';
import Metric from '../models/metric';

// need to use require() syntax because this package does not define default...
const request = require('request-promise-native');

/**
 * JSON POST logger
 *
 * Passes off a log message to a remote endpoint.
 */
export class JsonPostLogger extends ContribLogger implements LoggerInterface {
  constructor(options?: LoggerOptions) {
    super({ ...options });
  }

  /**
   * Send the POST request.
   *
   * @param level Log level as a lowercase string
   * @param message The log message
   * @param payload The payload to include
   * @param options Call-specific options
   */
  async call(level: string, message: any, payload?: any, options?: LoggerOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions = this.getCallOptions(options);

      // call & wait for our before handlers
      const beforeResult = await this.before(message, payload, callOptions);

      if (callOptions.logLevel !== LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
        try {
          const thisMessage = this.getMessage(beforeResult.message);
          const thisPayload = this.getPayload(beforeResult.payload);
          const requestOptions: object = this.getRequestOptions({
            json: true,
            resolveWithFullResponse: true,
          }, level, thisMessage, thisPayload, callOptions);

          const response = await request(requestOptions);
          resolve(response);
        }
        catch (e) {
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

  /**
   * Build the request body and hand off to a requestBodyCallback if specified.
   *
   * @param level Log level string
   * @param message Message being logged
   * @param payload Current payload
   * @param options Call-specific options
   */
  getRequestBody(level: string, message: any, payload: any = {}, options: LoggerOptions = {}): object {
    const callOptions = this.getCallOptions(options);
    const dataDefaults = (callOptions.dataDefaults) ? callOptions.dataDefaults : {};
    let body = {
      message,
      info: payload,
      severity: level,
      type: level,
      ...dataDefaults,
    };


    if (callOptions.requestBodyCallback) {
      body = callOptions.requestBodyCallback(body, {
        level, message, payload, callOptions,
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
  getRequestOptions(callRequest: object, level: string, message: any, payload: any, options: LoggerOptions): object {
    let thisCallRequest = request;
    if (options.requestOptionsCallback) {
      const result = options.requestOptionsCallback(thisCallRequest, level, message, payload, options);
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
      uri: this.getRequestUri(level, message, payload, options),
      body: this.getRequestBody(level, message, payload, options),
    };

    if (typeof thisRequest.body === 'object') {
      thisRequest.json = true;
    }

    return thisRequest;
  }

  /**
   * Get the request URI based on options.
   */
  getRequestUri(level: string, message: any, payload: any, options?: LoggerOptions): string {
    const callOptions = this.getCallOptions(options);
    let url = '';

    const scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
    const host = (callOptions.host) ? String(callOptions.host).replace(/^https?:\/\//, '') : 'localhost';
    const port = (callOptions.port) ? Number(callOptions.port) : null;
    const path = (callOptions.path) ? String(callOptions.path) : '/';

    url = `${scheme}://${host}`;
    if (port) {
      url += `:${port}`;
    }

    url += path;

    /* eslint-disable prefer-template */
    url = url.replace(/\$level(\/)?/, level + '$1');
    /* eslint-enable prefer-template */

    return url;
  }
}

/**
 * JSON POST metrics
 *
 * Passes off a metrics request to a remote endpoint.
 */
export class JsonPostMetrics extends ContribMetrics implements MetricsInterface {
  constructor(options?: LoggerOptions) {
    super({ ...options });
  }

  /**
   * Send the POST request.
   *
   * @param metricType The metric update being made (increment, decrement, timing)
   * @param metric The metric being updated
   * @param options Call-specific options
   */
  async call(metricType: string, metric: Metric, options?: MetricsOptions): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const callOptions = this.getCallOptions(options);

      // call & wait for our before handlers
      const beforeResult = await this.before(metricType, metric, callOptions);

      const requestOptions: object = this.getRequestOptions({
        json: true,
        resolveWithFullResponse: true,
      }, beforeResult.metricType, beforeResult.metric, callOptions);

      try {
        const response = await request(requestOptions);
        resolve(response);
      }
      catch (e) {
        reject(e);
      }
    });
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

  /**
   * Get the environment to pass in the body.
   */
  getEnvironment(): string {
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }
    else if (process.env.ENVIRONMENT) {
      return process.env.ENVIRONMENT;
    }
    return 'production';
  }

  /**
   * Build the request body and hand off to a requestBodyCallback if specified.
   *
   * @param metricType The type of call being made
   * @param metric The metric object being sent
   * @param options Call-specific options
   */
  getRequestBody(metricType: string, metric: Metric, options?: MetricsOptions): object {
    const callOptions = this.getCallOptions(options);
    const dataDefaults = (callOptions.dataDefaults) ? callOptions.dataDefaults : {};

    // build our request body
    let body = {
      environment: this.getEnvironment(),
      type: metricType,
      ...dataDefaults,
    };

    if (metric.value) {
      body.value = metric.value;
    }

    if (callOptions.requestBodyCallback) {
      body = callOptions.requestBodyCallback(body, { metricType, metric, callOptions });
    }

    return body;
  }

  /**
   * Get the request() options.
   *
   * @param request The current request() options
   * @param metricType The metric type being called
   * @param metric The metric being updated
   * @param options Call-specific options.
   */
  getRequestOptions(callRequest: object, metricType: string, metric: Metric, options: MetricsOptions): object {
    let thisCallRequest = callRequest;
    if (options.requestOptionsCallback) {
      const result = options.requestOptionsCallback(thisCallRequest, metricType, metric, options);
      if (result && typeof result === 'object') {
        thisCallRequest = result;
      }
      else {
        console.warn(`The results of Metrics.requestOptionsCallback did not return a correct value. Ignoring result with type: ${typeof result}`);
      }
    }

    const thisRequest: { method: string, uri: string, body: (string|object), json?: boolean } = {
      ...thisCallRequest,
      method: 'POST',
      uri: this.getRequestUri(metricType, metric, options),
      body: this.getRequestBody(metricType, metric, options),
    };

    if (typeof thisRequest.body === 'object') {
      thisRequest.json = true;
    }

    return thisRequest;
  }

  /**
   * Get the request path.
   *
   * @param metricType The metric type being sent
   * @param options An object of options for this call.
   */
  getRequestPath(metricType: string, options: MetricsOptions) {
    if (typeof options.paths !== 'undefined' && typeof options.paths[metricType] !== 'undefined') {
      return options.paths[metricType];
    }
    return (options.path) ? String(options.path) : '/';
  }

  /**
   * Get the request URI based on options.
   */
  getRequestUri(metricType: string, metric: Metric, options?: MetricsOptions): string {
    const callOptions = this.getCallOptions(options);

    let url = '';

    const scheme = (callOptions.scheme) ? callOptions.scheme : 'http';
    const host = (callOptions.host) ? String(callOptions.host).replace(/^https?:\/\//, '') : 'localhost';
    const port = (callOptions.port) ? Number(callOptions.port) : null;

    url = `${scheme}://${host}`;
    if (port) {
      url += `:${port}`;
    }

    url += this.getRequestPath(metricType, callOptions);

    /* eslint-disable prefer-template */
    const category = (metric.category) ? metric.category + '$1' : '';
    url = url.replace(/\$category(\/)?/, category);
    url = url.replace(/\$metric(\/)?/, metric.metric + '$1');
    /* eslint-enable prefer-template */

    return url;
  }
}
