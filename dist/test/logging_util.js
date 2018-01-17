"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../src/interfaces/logger");
const logging_1 = require("../src/util/logging");
test('getLogLevelConstant', () => {
    expect(logging_1.getLogLevelConstant('log')).toBe(logger_1.LOG_LEVELS.LOG_LOG);
    expect(logging_1.getLogLevelConstant('info')).toBe(logger_1.LOG_LEVELS.LOG_INFO);
});
//# sourceMappingURL=logging_util.js.map