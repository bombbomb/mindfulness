"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = require("nock");
const index_1 = require("../src/index");
test('log via post request to example.com', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger([
        { type: 'json_post', host: 'logging.example.com' }
    ]);
    const loggingEndpoint = nock_1.default('http://logging.example.com')
        .post('/', {
        severity: 'log',
        type: 'log',
        message: 'Hello!',
        info: {},
    })
        .reply(200, {});
    yield l.log('Hello!');
    expect(loggingEndpoint.isDone()).toBe(true);
    done();
}));
//# sourceMappingURL=json_post_logger.js.map