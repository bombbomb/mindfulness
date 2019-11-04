/**
 * Metric class for modeling metric values.
 *
 * Metrics consist of an optional category, the metric itself, and a value.
 */
export default class Metric {
    category: string;
    metric: string;
    value: any;
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
    constructor(...args: any[]);
    toArray(): [string, string, any];
    toString(): string;
}
