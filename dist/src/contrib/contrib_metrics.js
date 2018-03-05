"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mindfulness_1 = require("./mindfulness");
var ContribMetrics = /** @class */ (function (_super) {
    __extends(ContribMetrics, _super);
    function ContribMetrics() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'metrics';
        return _this;
        /**
         * Process any before handlers.
         *
         * @param metricType The metric type being called
         * @param metric The Metric object
         * @param options Current options for this call.
         */
        // async before(metricType: string, metric: MetricInterface, options?: MetricsOptions): Promise<any> {
        //   const before = async () => (
        //     new Promise(async (resolve, reject) => {
        //       if (options.before) {
        //         const result = await options.before.apply(this, [metricType, metric, options]);
        //         if (typeof result.metric === 'undefined') {
        //           const keys = Object.keys(result).join(', ');
        //           throw new Error(`The before callback must include the metric object. Received: ${keys}`);
        //         }
        //         if (typeof result.options === 'undefined') {
        //           const keys = Object.keys(result).join(', ');
        //           throw new Error(`The before callback must include the options object. Received: ${keys}`);
        //         }
        //         return resolve({ metricType, metric: result.metric, options: result.options });
        //       }
        //       return resolve({ metricType, metric, options });
        //     })
        //   );
        //   return before();
        // }
    }
    return ContribMetrics;
}(mindfulness_1.default));
exports.default = ContribMetrics;
//# sourceMappingURL=contrib_metrics.js.map