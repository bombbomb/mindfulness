"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../interfaces/logger");
/**
 * Get the LOG_LEVELS constant for a given log level.
 *
 * @param level The level as a lowercase string (e.g., 'log', 'warn').
 */
function getLogLevelConstant(level) {
    const levelName = 'LOG_' + level.toUpperCase();
    return logger_1.LOG_LEVELS[levelName];
}
exports.getLogLevelConstant = getLogLevelConstant;
//# sourceMappingURL=logging.js.map