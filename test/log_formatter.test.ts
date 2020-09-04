import * as assert from 'assert';
import LogFormatter from '../src/log_formatter';
import { formatUTCDateRuby } from '../src/util';
import { LoggerSeverity, LoggerSeverityString } from '../src/constant';
import { stubTracerWithContext, stubTracerWithoutContext } from './test_util';

const defaultEnv = 'testing';
const defaultService = 'my_service';
const defaultVersion = '0xbeaf';
const defaultProgname = 'my_progname';
const defaultLogTemplate = '[${datetime}][${progname}][${severity}][${trace}] ${msg}';
const defaultTraceTemplate =
  'dd.env=${env} dd.service=${service} dd.version=${version} dd.trace_id=${trace_id} dd.span_id=${span_id}';
const defaultDateFunc = formatUTCDateRuby;

describe('LogFormatter', () => {
  it('formats with an active context', () => {
    const tid = '1234567890';
    const sid = '0987654321';
    const stubTracer = stubTracerWithContext(tid, sid);

    const formatter = new LogFormatter(stubTracer, {
      env: defaultEnv,
      service: defaultService,
      version: defaultVersion,
      progname: defaultProgname,
      logTemplate: defaultLogTemplate,
      traceTemplate: defaultTraceTemplate,
      dateFunc: defaultDateFunc,
    });

    const dt = new Date(0);
    const msg = 'hello world';
    Object.keys(LoggerSeverity).forEach((key: LoggerSeverityString) => {
      assert.strictEqual(
        formatter.format(dt, key, msg),
        `[1970-01-01 00:00:00 +0000][my_progname][${LoggerSeverity[key]}][dd.env=testing dd.service=my_service dd.version=0xbeaf dd.trace_id=${tid} dd.span_id=${sid}] ${msg}`
      );
    });
  });

  it('formats withount a context', () => {
    const stubTracer = stubTracerWithoutContext();
    const formatter = new LogFormatter(stubTracer, {
      env: defaultEnv,
      service: defaultService,
      version: defaultVersion,
      progname: defaultProgname,
      logTemplate: defaultLogTemplate,
      traceTemplate: defaultTraceTemplate,
      dateFunc: defaultDateFunc,
    });

    const dt = new Date(0);
    const msg = 'hello world';
    Object.keys(LoggerSeverity).forEach((key: LoggerSeverityString) => {
      assert.strictEqual(
        formatter.format(dt, key, msg),
        `[1970-01-01 00:00:00 +0000][my_progname][${LoggerSeverity[key]}][dd.env=testing dd.service=my_service dd.version=0xbeaf dd.trace_id=1 dd.span_id=1] ${msg}`
      );
    });
  });

  it('accepts non-default format', () => {
    const tracer = stubTracerWithoutContext();
    const loggerOption = {
      env: 'production',
      service: 'my-service',
      version: '0001',
      progname: 'my-app',
      logTemplate:
        '{"datetime": "${datetime}", "progname": "${progname}", "serverity": "${severity}", "dd": ${trace}, "message": ${msg}}',
      traceTemplate:
        '{"env": "${env}", "service": "${service}", "version": "${version}", "trace_id": "${trace_id}", "span_id": "${span_id}"}',
      dateFunc: (d) => {
        return d.toISOString();
      },
    };
    const formatter = new LogFormatter(tracer, loggerOption);
    const dt = new Date(0);
    const msg = '"hello world"';
    Object.keys(LoggerSeverity).forEach((key: LoggerSeverityString) => {
      assert.strictEqual(
        formatter.format(dt, key, msg),
        `{"datetime": "1970-01-01T00:00:00.000Z", "progname": "my-app", "serverity": "${LoggerSeverity[key]}", "dd": {"env": "production", "service": "my-service", "version": "0001", "trace_id": "1", "span_id": "1"}, "message": "hello world"}`
      );
    });
  });
});
