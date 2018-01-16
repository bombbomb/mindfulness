"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../src/interfaces/logger");
test('LOG_LEVELS.LOG_ALL contains all types', () => {
    expect(logger_1.LOG_LEVELS.LOG_ALL & logger_1.LOG_LEVELS.LOG_LOG).toBeGreaterThan(0);
    expect(logger_1.LOG_LEVELS.LOG_ALL & logger_1.LOG_LEVELS.LOG_INFO).toBeGreaterThan(0);
    expect(logger_1.LOG_LEVELS.LOG_ALL & logger_1.LOG_LEVELS.LOG_WARN).toBeGreaterThan(0);
    expect(logger_1.LOG_LEVELS.LOG_ALL & logger_1.LOG_LEVELS.LOG_ERROR).toBeGreaterThan(0);
});
//# sourceMappingURL=logger_interface.js.map