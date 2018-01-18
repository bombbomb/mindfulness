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
test('log via post payload request to example.com', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger([
        { type: 'json_post', host: 'logging.example.com' }
    ]);
    const loggingEndpoint = nock_1.default('http://logging.example.com')
        .post('/', {
        severity: 'log',
        type: 'log',
        message: 'Hello!',
        info: { example: 123 },
    })
        .reply(200, {});
    yield l.log('Hello!', { example: 123 });
    expect(loggingEndpoint.isDone()).toBe(true);
    done();
}));
test('log object for message', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger([
        { type: 'json_post', host: 'logging.example.com' }
    ]);
    const loggingEndpoint = nock_1.default('http://logging.example.com')
        .post('/', (req) => {
        expect(req).toEqual({
            severity: 'log',
            type: 'log',
            message: '{"example":123}',
            info: {}
        });
        return true;
    })
        .reply(200, {});
    yield l.log({ example: 123 });
    expect(loggingEndpoint.isDone()).toBe(true);
    done();
}));
test('log error for payload', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger([
        { type: 'json_post', host: 'logging.example.com' }
    ]);
    const loggingEndpoint = nock_1.default('http://logging.example.com')
        .post('/', (req) => {
        expect(req).toMatchObject({
            severity: 'log',
            type: 'log',
            message: 'Error doing things',
            info: {
                message: 'You did everything wrong',
                stack: expect.any(String),
            }
        });
        return true;
    })
        .reply(200, {});
    yield l.log('Error doing things', new Error('You did everything wrong'));
    expect(loggingEndpoint.isDone()).toBe(true);
    done();
}));
test('can change request body', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger([
        {
            type: 'json_post',
            host: 'logging.example.com',
            requestHandler: (body, details) => {
                return Object.assign({}, body, { injected: 123 });
            }
        }
    ]);
    const loggingEndpoint = nock_1.default('http://logging.example.com')
        .post('/', (req) => {
        expect(req).toMatchObject({
            severity: 'log',
            type: 'log',
            message: 'Error doing things',
            injected: 123,
            info: {
                payload: 234,
            }
        });
        return true;
    })
        .reply(200, {});
    yield l.log('Error doing things', { payload: 234 });
    expect(loggingEndpoint.isDone()).toBe(true);
    done();
}));
test('can change request body on a call', (done) => __awaiter(this, void 0, void 0, function* () {
    const l = new index_1.Logger([
        {
            type: 'json_post',
            host: 'logging.example.com',
        }
    ]);
    const loggingEndpoint = nock_1.default('http://logging.example.com')
        .post('/', (req) => {
        expect(req).toMatchObject({
            severity: 'log',
            type: 'log',
            message: 'Error doing things',
            injected: 123,
            info: {
                payload: 234,
            }
        });
        return true;
    })
        .reply(200, {});
    yield l.log('Error doing things', { payload: 234 }, { requestHandler: (body, details) => {
            return Object.assign({}, body, { injected: 123 });
        } });
    expect(loggingEndpoint.isDone()).toBe(true);
    done();
}));
//# sourceMappingURL=json_post_logger.js.map