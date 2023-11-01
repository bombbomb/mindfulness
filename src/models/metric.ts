/**
 * Metric class for modeling metric values.
 *
 * Metrics consist of an optional category, the metric itself, and a value.
 */
export default class Metric {
  category: string = null;

  metric: string = null;

  value: unknown = null;

  /**
   * Creates a new metric value.
   *
   * This maybe one of the following:
   *
   * ```
   * new Metric('metric');
   * new Metric('metric', 10);
   * new Metric('category', 'metric');
   * new Metric('category', 'metric', 10);
   * ```
   *
   * String values would need to use the three argument version. Date values are converted to
   * timestamps.
   *
   * @param args Arguments array
   */
  constructor(...args) {
    const { length } = args;

    if (length > 0 && args[0] instanceof Metric) {
      [this.metric, this.category, this.value] = (<Metric>args[0]).toArray();
      return;
    }

    switch (length) {
      case 1:
        [this.metric] = args;
        break;

      case 2:
        if (typeof args[0] === 'string' && typeof args[1] === 'string') {
          [this.category, this.metric] = args;
        }
        else {
          [this.metric, this.value] = args;
        }
        break;

      case 3:
        [this.category, this.metric, this.value] = args;
        break;

      default:
        break;
    }

    if (this.value && this.value instanceof Date) {
      this.value = this.value.getTime();
    }
  }

  toArray(): [string, string, unknown] {
    return [this.metric, this.category, this.value];
  }

  toString(): string {
    if (!this.category) {
      return this.metric;
    }
    return `${this.category}.${this.metric}`;
  }
}
