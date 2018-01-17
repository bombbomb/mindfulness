import nock from 'nock';
import { Logger } from '../src/index';

test('log via post request to example.com', async (done) => {
  const l = new Logger([
    {type: 'json_post', host: 'logging.example.com'}
  ]);

  const loggingEndpoint = nock('http://logging.example.com')
    .post('/', {
      severity: 'log',
      type: 'log',
      message: 'Hello!',
      info: {},
    })
    .reply(200, {});

  await l.log('Hello!');

  expect(loggingEndpoint.isDone()).toBe(true);
  done();
});
