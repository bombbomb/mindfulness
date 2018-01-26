"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ContribMetrics = /** @class */ (function () {
    function ContribMetrics(options) {
        this.options = __assign({}, options);
    }
    /**
     * Get the options for a specific call.
     *
     * Basically will return an options object for a specific call merged with the logger's
     * default options.
     *
     * @param options Call specific options
     */
    ContribMetrics.prototype.getCallOptions = function (options) {
        // if we have call options, override the defaults or just return the defaults.
        return (options) ? __assign({}, this.options, options) : __assign({}, this.options);
    };
    return ContribMetrics;
}());
exports.default = ContribMetrics;
//# sourceMappingURL=contrib_metrics.js.map