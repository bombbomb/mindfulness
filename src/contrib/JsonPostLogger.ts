import { LoggerInterface, LOG_LEVELS } from '../interfaces/logger';
import ContribLogger from './contrib_logger';
import getLogLevelConstant from '../util/logging';
import { MindfulnessOptions } from '../interfaces/options';
import { ResponseError } from '../errors/ResponseError';
import { JsonPostHandler } from './JsonPostHandler';

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
  async call(level: string, message: unknown, payload?: unknown, options?: MindfulnessOptions): Promise<Response | null> {
    const callOptions = this.getCallOptions(options);

    // call & wait for our before handlers
    const beforeResult = await this.before({ message, payload }, callOptions);

    if (callOptions.logLevel !== LOG_LEVELS.LOG_NONE && callOptions.logLevel & getLogLevelConstant(level)) {
      const thisMessage = this.getMessage(beforeResult.message);
      const thisPayload = this.getPayload(beforeResult.payload);
      try {
        const response = await this.json.post({ level, message: thisMessage, payload: thisPayload }, callOptions);
        if (!response.ok) {
          throw new ResponseError('Received non-OK status from JSON post', response);
        }
        return response;
      }
      catch (e) {
        this.debug('mindfulness logging error', e);
        throw e;
      }
    }

    // not logged due to log levels
    return null;
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
