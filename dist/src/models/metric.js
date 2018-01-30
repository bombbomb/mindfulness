"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Metric class for modeling metric values.
 *
 * Metrics consist of an optional category, the metric itself, and a value.
 */
var Metric = /** @class */ (function () {
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
     * String values would need to use the three argument version.
     *
     * @param args Arguments array
     */
    function Metric() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.category = null;
        this.metric = null;
        this.value = null;
        var length = args.length;
        if (length > 0 && args[0] instanceof Metric) {
            _a = args[0].toArray(), this.metric = _a[0], this.category = _a[1], this.value = _a[2];
            return;
        }
        switch (length) {
            case 1:
                this.metric = args[0];
                break;
            case 2:
                if (typeof args[0] === 'string' && typeof args[1] === 'string') {
                    this.category = args[0], this.metric = args[1];
                }
                else {
                    this.metric = args[0], this.value = args[1];
                }
                break;
            case 3:
                this.category = args[0], this.metric = args[1], this.value = args[2];
                break;
            default:
                break;
        }
        var _a;
    }
    Metric.prototype.toArray = function () {
        return [this.metric, this.category, this.value];
    };
    Metric.prototype.toString = function () {
        if (!this.category) {
            return this.metric;
        }
        return this.category + "." + this.metric;
    };
    return Metric;
}());
exports.default = Metric;
//# sourceMappingURL=metric.js.map