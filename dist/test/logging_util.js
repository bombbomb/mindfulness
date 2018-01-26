"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../src/interfaces/logger");
var logging_1 = require("../src/util/logging");
test('getLogLevelConstant', function () {
    expect(logging_1.default('log')).toBe(logger_1.LOG_LEVELS.LOG_LOG);
    expect(logging_1.default('info')).toBe(logger_1.LOG_LEVELS.LOG_INFO);
});
//# sourceMappingURL=logging_util.js.map