const debug = require('debug');
const { Logger } = require('../dist/src/index');

debug.enable('*');
const myLogger = new Logger([{ type: 'debug', namespace: 'example' }]);
myLogger.log('Hi');
myLogger.log('Data', {
  message: 'Hi',
});
