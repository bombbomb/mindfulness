const { Metrics } = require('../dist/src/index');

const m = new Metrics([{
  type: 'json_post',
  host: 'localhost:3000',
}]);

m.increment('test', 10);
