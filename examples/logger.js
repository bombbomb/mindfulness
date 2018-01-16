const { Logger } = require('../dist/src/index');

const myLogger = new Logger(['console']);
myLogger.log('Hi');
myLogger.log('Data', {
  message: 'Hi',
});
