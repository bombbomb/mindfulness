"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
function getMindfulnessVersion() {
    return new Promise(function (resolve) {
        fs_1.readFile(path_1.join(__dirname, '../../package.json'), 'utf8', function (err, data) {
            var version = '';
            if (!err) {
                try {
                    var config = JSON.parse(data);
                    /* eslint-disable */
                    version = config.version;
                    /* eslint-enable */
                }
                catch (parseErr) {
                    console.error('Could not parse package.json for mindfulness version');
                }
            }
            resolve(version);
        });
    });
}
exports.default = getMindfulnessVersion;
//# sourceMappingURL=version.js.map