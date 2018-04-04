import { DetailsInterface, MindfulnessOptions } from '../interfaces/options';

const RATE_LIMIT_GC = 6;
const RATE_LIMIT_STALE = 60 * 1000;
const RATE_LIMIT_TIMEOUT = 2 * 60 * 1000;
const RATE_LIMIT_MESSAGE_THRESHOLD = 50;

export default class RateLimiter {
  messages: object = {};

  getMessageKey(details: DetailsInterface, options?: MindfulnessOptions) {
    let key = '__all__';
    if (options.rateLimitKey) {
      key = details[options.rateLimitKey];
    }

    if (options.rateLimitKeyCallback) {
      key = options.rateLimitKeyCallback(key, details);
    }

    return key;
  }

  allowed(details: DetailsInterface, options: MindfulnessOptions = {}) {
    const key = this.getMessageKey(details, options);

    this.collectGarbage(options);

    // if there is a filter, apply it and if we are not rate limiting this message,
    // pass it through like normal...
    if (options.rateLimitFilter && !options.rateLimitFilter(details, options)) {
      return true;
    }

    // new entry
    if (!this.messages[key]) {
      this.messages[key] = {
        ts: (new Date()).getTime(),
        count: 1,
      };
      return true;
    }

    // message exists, so we should check if it should be sent...
    const rateExpiration = options.rateLimitExpiration || RATE_LIMIT_STALE;
    const messageThreshold = options.rateLimitMessageThreshold || RATE_LIMIT_MESSAGE_THRESHOLD;
    const expiration = Date.now() - rateExpiration;

    // if the last timestamp for this message is past the expiration, then
    // we can send this message and reset this entry...
    if (this.messages[key].ts < expiration) {
      this.messages[key].ts = Date.now();
      this.messages[key].count = 1;
      return true;
    }
    else if (this.messages[key].count < messageThreshold) {
      this.messages[key].ts = Date.now();
      this.messages[key].count += 1;
      return true;
    }
    return false;
  }

  /**
   * Trim old messages from our rate tracking.
   *
   * @param options Any options
   * @param force Force GC (normally there is a strong chance that GC will occur, occasionally it will not)
   */
  collectGarbage(options: MindfulnessOptions, force: boolean = false) {
    // 60% chance of GC
    const collect = this.getRandomInt(0, 10) <= RATE_LIMIT_GC;
    if (!collect && !force) {
      return;
    }

    const stale = options.rateLimitStaleTime || RATE_LIMIT_STALE;
    const staleTime = Date.now() - stale;

    const keys = Object.keys(this.messages);
    const newRates = {};
    for (let i = 0; i < keys.length; i += 1) {
      if (this.messages[keys[i]].ts >= staleTime) {
        newRates[keys[i]] = this.messages[keys[i]];
      }
    }
    this.messages = newRates;
  }

  getRandomInt(min, max) {
    const randomMin = Math.ceil(min);
    const randomMax = Math.floor(max);
    return Math.floor(Math.random() * (randomMax - randomMin)) + randomMin;
  }
}
