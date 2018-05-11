# @bblabs/mindfulness

[![Build Status](https://travis-ci.org/bombbomb/mindfulness.svg?branch=master)](https://travis-ci.org/bombbomb/mindfulness)

A simple interface for logging and metrics endpoints.

## Install

    npm install --save @bblabs/mindfulness

## Logging usage

```javascript
const Logger = require('@bblabs/mindfulness').Logger;

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
logger.log('Message', {payload: 123}, {requestBodyCallback: (body, details) => {
  return {
    ...body,
    // add .environment to the body
    environment: process.env.NODE_ENV
  };
}});
```

**Note:** logging methods are _asynchronous_ and return a `Promise`. So you can use `await` or handle the `Promise` if you want to ensure things worked.

The `Logger` interface also supports "log levels". This allows you to specify the output levels you would like via flags. By default everything is logged.

```javascript
const l = new Logger(['console'], {
  // logLevel can be a single level or multiple:
  //   LOG_LEVELS.LOG_ERROR | LOG_LEVELS.LOG_LOG
  // log only errors:
  logLevel: Logger.LOG_LEVELS.LOG_ERROR,
});
```

## Metrics usage

```javascript
const Metrics = require('@bblabs/mindfulness').Metrics;

const metrics = new Metrics([
  // post metrics to metrics.example.com
  {
    type: 'json_post',
    host: 'metrics.example.com',
    // specify distinct paths for each type of metric call
    paths: {
      increment: '/increment',
      // also supports $category and $metric variables to replace path with those items
      // if $category is blank, it will not be used (and if there's a forward slash in
      // the url following $category, mindfulness will remove that too)
      timing: '/feature/$category/$metric',
    }
  }
]);

// metric with a value
metrics.increment('metric', 10);
metrics.increment('category', 'metric');

// metric with a value... if you need the value to be a string, you must specify
// a category and metric.
metrics.increment('category', 'metric', 10);
metrics.timing('category', 'metric', value);
```

Metrics JSON POST can handle multiple paths for each metric type:

```javascript
const metrics = new Metrics()
```

## Error handling

All logging & metrics calls are asynchronous, which also means that errors may occur. Since this package uses native Promises these need to be handled or you will get warnings about unhandled rejections.

To do this, you can either implement your own error handling _or_ use the `silent()` option:

```javascript
// this will silence any errors that come from sending this metric
metrics.silent().increase('metric');

// you can still view errors in the metrics object if you want:
if (metrics.errors) {
  console.warn('There were errors sending metrics');
}
```

`.silent()` only works on the current request: it will only stop an error from the current call, not subsequent calls.

Additionally, you can configure both classes to always supress errors with `alwaysSilent: true` in it's options.

## Before/After

Both `Metrics` and `Logging` support before and after hooks:

```javascript
const logging = new Logging(['console'], {
  before: (message, payload, options) => {
    return [message.toUpperCase(), payload, options];
  }
});

const metrics = new Metrics(['console'], {
  before: (metricType, metric) => {
    if (!metric.value) {
      metric.value = 1;
    }
    return {metric};
  }
});
```

## JSON POST

JSON POST also can also be modified/customized in a few ways:

```javascript
const l = new Logger([{
  type: 'json_post',
  // include extra things in the body by default...
  dataDefaults: { includedInBody: 'example' },
  // modify the "body" that is posted to the endpoint...
  requestBodyCallback: (body, details) => {
    return {
      ...body,
      anotherThing: 123,
    }
  }
}]);
```

The JSON POST functionality will also default to `localhost` if you do not specify a host.

## Development

```
nvm use
npm install
```

To build from Typescript: `npm build` or `npm build-watch`

To test: `npm test` or `npm test-watch`

## Future

* Custom metrics/logger outputs? e.g. `new Metrics([MySpecialMetricsHandler])`
