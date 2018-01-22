"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Metric {
    constructor(...args) {
        this.category = null;
        this.metric = null;
        this.value = null;
        const length = args.length;
        if (length > 0 && args[0] instanceof Metric) {
            [this.metric, this.category, this.value] = args[0].toArray();
            return;
        }
        switch (length) {
            case 1:
                [this.metric] = args;
                break;
            case 2:
                if (typeof args[0] == 'string' && typeof args[1] == 'string') {
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
    toArray() {
        return [this.metric, this.category, this.value];
    }
    toString() {
        if (!this.category) {
            return this.metric;
        }
        return this.category + '.' + this.metric;
    }
}
exports.default = Metric;
//# sourceMappingURL=metric.js.map