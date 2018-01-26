export default class Metric {
  category: string = null;
  metric: string = null;
  value: any = null;

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
  }

  toArray(): [string, string, any] {
    return [this.metric, this.category, this.value];
  }

  toString(): string {
    if (!this.category) {
      return this.metric;
    }
    return `${this.category}.${this.metric}`;
  }
}
