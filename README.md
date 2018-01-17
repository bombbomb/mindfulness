# bmindful

A simple interface for logging and metrics endpoints.

## Install

    npm install --save bmindful

## Logging usage

```javascript
const Logger = require('bmindful').Logger;

const logger = new Logger([
  'console',
  {
    type: 'json_post',
    host: 'logging.example.com',
    path: '/',
  }
]);

// sends logs to console & logging.example.com
logger.log('Message', {payload: 123});
logger.logWarn('Message', {payload: 123});
logger.logError('Message', {payload: 123});
logger.logInfo('Message', {payload: 123});
```

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
