import { get } from 'lodash';
import { MindfulnessOptions, DetailsInterface } from '../interfaces/options';
import getMindfulnessVersion from '../util/version';
import Mindfulness from './mindfulness';
import { MetricsRequestBodyCallback } from '../interfaces/callbacks';

export class JsonPostHandler {
  parentObject: Mindfulness;

  version: string;

  constructor(parent: Mindfulness) {
    this.parentObject = parent;
  }

  /**
   * Build a message body from a message template.
   *
   * @param details Body message details
   * @param options Request options
   */
  async buildBody(details: object, options: MindfulnessOptions): Promise<Record<string, unknown>> {
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

          // try to get a value via lodash.get
          else if (get(details, value)) {
            body[keyName] = get(details, value);
          }
        }
        else if (value in variables) {
          body[key] = variables[value];
        }

        // try to get a value via lodash.get
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
  async getRequestBody(details: DetailsInterface, options: MindfulnessOptions = {}): Promise<BodyInit> {
    const dataDefaults = (options.dataDefaults) ? options.dataDefaults : {};
    const builtBody = await this.buildBody(details, options);
    let body: ReturnType<MetricsRequestBodyCallback> = {
      ...builtBody,
      ...dataDefaults,
    };

    if (options.requestBodyCallback) {
      body = options.requestBodyCallback(body, {
        ...details,
        options,
      });
    }

    return JSON.stringify(body, options.jsonReplacer ?? undefined);
  }

  /**
   * Get the request() options.
   *
   * @param callRequest The current request() options
   * @param metricType The metric type being called
   * @param metric The metric being updated
   * @param options Call-specific options.
   */
  async getRequestOptions(callRequest: RequestInit, details: DetailsInterface, options: MindfulnessOptions): Promise<RequestInit> {
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

    const thisRequest: RequestInit = {
      ...thisCallRequest,
      method: 'POST',
      body: await this.getRequestBody(details, options),
    };

    return thisRequest;
  }

  /**
   * Get the request path.
   *
   * @param metricType The metric type being sent
   * @param options An object of options for this call.
   */
  getRequestPath(details: DetailsInterface, options: MindfulnessOptions) {
    if (typeof details.metricType === 'string') {
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

  async post(details: DetailsInterface, options: MindfulnessOptions) {
    if (!this.version) {
      this.version = await getMindfulnessVersion();
    }

    const requestOptions: object = await this.getRequestOptions({
      headers: {
        'User-Agent': `mindfulness/${this.version}`,
      },
    }, details, options);
    const requestUrl = this.getRequestUri(details, options);

    this.parentObject.debug('mindfulness logging', { requestUrl, requestOptions });
    // eslint-disable-next-line no-return-await
    const promise = fetch(requestUrl, requestOptions);
    const response = await promise;
    if (response === undefined) {
      throw new Error('WTH');
    }
    return response;
  }
}
