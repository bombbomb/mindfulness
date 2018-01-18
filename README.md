# bmindful

A simple interface for logging and metrics endpoints.

## Install

    npm install --save bmindful

## Logging usage

```javascript
const Logger = require('bmindful').Logger;

const logger = new Logger([
  // log to the console
  'console',

  // post to http://logging.example.com/
  {
    type: 'json_post',
    host: 'logging.example.com',
  }
]);

// e.g.:
//   console.log('Message', {payload: 123})
//   request('http://logging.example.com').post({
//     severity: 'log',
//     type: 'log',
//     message: 'Message',
//     info: { payload: 123}
//   })
logger.log('Message', {payload: 123});
logger.logWarn('Message', {payload: 123});
logger.logError('Message', {payload: 123});

// send the log request and catch any errors
try {
  await logger.logInfo('Message', {payload: 123});
}
catch (err) {
}

// change the request body with the post logger:
logger.log('Message', {payload: 123}, {requestHandler: (body, details) => {
  return {
    ...body,
    // add .environment to the body
    environment: process.env.NODE_ENV
  };
}});
```

**Note:** logging methods are _asynchronous_ and return a `Promise`. So you can use `await` or handle the `Promise` if you want to ensure things worked.

## Metrics usage

```javascript
const Metrics = require('bmindful').Metrics;

const metrics = new Metrics('myapp', [
  'console',
  {
    type: 'json_post',
    host: 'metrics.example.com',
    path: '/',
  }
]);

metrics.increase('category', 'metric');
metrics.decrease('category', 'metric');
```

## Development

```
nvm use
npm install
```

To build from Typescript: `npm build` or `npm build-watch`

To test: `npm test` or `npm test-watch`
