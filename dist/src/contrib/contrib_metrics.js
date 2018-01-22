"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContribMetrics {
    constructor(parent, options) {
        this.parent = parent;
        this.options = Object.assign({}, options);
    }
    /**
     * Get the options for a specific call.
     *
     * Basically will return an options object for a specific call merged with the logger's
     * default options.
     *
     * @param options Call specific options
     */
    getCallOptions(options) {
        // if we have call options, override the defaults or just return the defaults.
        return (options) ? Object.assign({}, this.options, options) : Object.assign({}, this.options);
    }
}
exports.default = ContribMetrics;
//# sourceMappingURL=contrib_metrics.js.map