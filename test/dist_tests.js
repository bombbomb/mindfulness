const nock = require('nock');
const { Metrics } = require('../dist/src/index');

test('Metrics can post', async (done) => {
  const m = new Metrics([{
    type: 'json_post',
    host: 'example.com',
  }]);

  const endpoint = nock(/example\.com/)
    .post('/')
    .reply(200, {});


  await m.increment('test', 10);

  expect(endpoint.isDone()).toBe(true);
  done();
});
