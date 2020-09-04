# `js-trace-logger`

`js-trace-logger` decorates messages with DataDog Trace/Span ID and writes it to `console.log()`. So you can connect APM and Log!

## Getting Started

Install `js-trace-logger` using `npm`:

```bash
npm install --save @apartmentlist/js-trace-logger
```

Let's configure it:

```JavaScript
import { tracer } from 'dd-trace';
import Logger from '@apartmentlist/js-trace-logger';

const env     = process.env.DD_ENV     || 'development';
const service = process.env.DD_SERVICE || 'my_app';
const version = prcesss.env.DD_VERSION || 'dev';
if (process.env.DD_API_KEY) {
  tracer.init({ env, service, version });
}
Logger.boot(tracer, { env, service, version });

// this is optional: If you don't need the decoration in
// non-production environments.
if (env !== 'production') {
  Logger.passThru = true;
}

Logger.warn('hello!');
// => [2019-01-16 18:38:41 +0000][my_app][WARN][dd.env=development dd.service=my_app dd.version=dev dd.trace_id=8545847825299552251 dd.span_id=3711755234730770098] hello!
```

The default log decoration is set to Datadog's recommendation as [For logging in Ruby applications](https://docs.datadoghq.com/tracing/connect_logs_and_traces/ruby/#for-logging-in-ruby-applications). See [More](#More) on how to configure other style.

## Usage

```JavaScript
Logger.info('foobar');
  // => […][INFO][…] foobar

// Method footprint is `console.log()` compatible.
Logger.debug('hello', 'world', 111);
  // => […][DEBUG][…] Hello world 111

// You can set a log level to filter messages
Logger.level = 'warn';
Logger.info('not showing');
Logger.warn('showing');
  // => […][WARN][…] showing

// Object and array will be JSON.stringify()-ed
const obj = {a: 1, b: true};
Logger.warn(obj);
  // => […][WARN][…] {"a":1,"b":true}

// Error instance will be converted to a special construct
const err = new SyntaxError('something');
Logger.error(err);
  // => […][ERROR][…] {"error":{"class":"SyntaxError","message":"something","stacktrace":[…]}
```

## More

If you wanna do something different:

```JavaScript
const loggerOption = {
	env: 'production',
	service: 'my-service',
	version: '0001',
	progname: 'my-app',
	logTemplate: '{"datetime": "${datetime}", "progname": "${progname}", "serverity": "${severity}", "dd": ${trace}, "message": ${msg}}',
	traceTemplate: '{"env": "${env}", "service": "${service}", "version": "${version}", "trace_id": ${trace_id}, "span_id": ${span_id}}'
	dateFunc: (d) => {
		return d.toISOString();
	}
};
Logger.boot(tracer, loggerOption);
Logger.info(JSON.stringify('hello world"));
  // => {"datetime": "1970-01-01T00:00:00.000Z", "progname": "my-app", "serverity": "INFO", "dd": {"env": "production", "service": "my-service", "version": "0001", "trace_id": "1", "span_id": "1"}, "message": "hello world"}
```