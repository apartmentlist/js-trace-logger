import * as assert from 'assert';
import * as TestConsole from 'test-console';
import { stubTracerWithoutContext, cleanupConsoleEscapeSequence } from './test_util';
import { LoggerSeverityIndex } from '../src/constant';

import Logger from '../src/logger';

const stdout = TestConsole.stdout;
const TEST_ENV = 'testing';
const TEST_SRV = 'logger';
const TEST_VRS = '0x00001';

describe('Logger', () => {
  before(() => {
    const tracer = stubTracerWithoutContext();
    Logger.boot(tracer, TEST_ENV, TEST_SRV, TEST_VRS);
  });

  let originalLoggerLevel;
  beforeEach(() => {
    originalLoggerLevel = Logger.level;
  });

  afterEach(() => {
    Logger.level = originalLoggerLevel;
  });

  describe('debug|info|warn|error', () => {
    it('accepts multiple args for passThru output', () => {
      Logger.level = 'debug';
      Logger.passThru = true;
      const output = stdout.inspectSync(() => {
        Logger.debug(1, 'this', true, ['foo'], { bar: 'baz' });
        Logger.info(1, 'this', true, ['foo'], { bar: 'baz' });
        Logger.warn(1, 'this', true, ['foo'], { bar: 'baz' });
        Logger.error(1, 'this', true, ['foo'], { bar: 'baz' });
      });
      Logger.passThru = false;
      // Because Mocha colorize the output...
      ['debug', 'info', 'warn', 'error'].forEach((key, idx) => {
        assert.strictEqual(
          cleanupConsoleEscapeSequence(output[idx]),
          `[${key}] 1 this true [ 'foo' ] { bar: 'baz' }\n`
        );
      });
    });
  });

  describe('convertErrorToJson', () => {
    it('converts a simple error', () => {
      const e = new Error('hello');
      const errJson = Logger.convertErrorToJson(e);
      assert.strictEqual(errJson.error.class, 'Error');
      assert.strictEqual(errJson.error.message, 'hello');
      assert.match(errJson.error.stacktrace[0], /test\/logger\.test\.ts/);
    });

    it('converts builtin errors', () => {
      [EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError].forEach((errorConst) => {
        const e = new errorConst('hello');
        const errJson = Logger.convertErrorToJson(e);
        assert.strictEqual(errJson.error.class, errorConst.name);
        assert.strictEqual(errJson.error.message, 'hello');
      });
    });

    it('accepts extra properties', () => {
      const e = new Error('hello');
      const errJson = Logger.convertErrorToJson(e, { foo: 'foo', bar: 1234, baz: true, qux: [1, 2, 3] });
      assert.strictEqual(errJson.error.class, 'Error');
      assert.strictEqual(errJson.error.message, 'hello');
      assert.strictEqual(errJson.foo, 'foo');
      assert.strictEqual(errJson.bar, 1234);
      assert.strictEqual(errJson.baz, true);
      assert.deepEqual(errJson.qux, [1, 2, 3]);
    });
  });

  describe('passThru', () => {
    before(() => {
      Logger.passThru = true;
    });

    it('pass through message directly to console', () => {
      Logger.level = 'debug';
      const output = stdout.inspectSync(() => {
        Logger.debug('hi');
        Logger.info('this');
        Logger.warn('is');
        Logger.error('fine');
      });
      assert.deepEqual(output, ['[debug] hi\n', '[info] this\n', '[warn] is\n', '[error] fine\n']);
    });

    after(() => {
      Logger.passThru = false;
    });
  });

  describe('level', () => {
    it('sets severity level', () => {
      Logger.level = 'debug';
      assert.strictEqual((<any>Logger).severityIndex, LoggerSeverityIndex.debug);
      Logger.level = 'info';
      assert.strictEqual((<any>Logger).severityIndex, LoggerSeverityIndex.info);
      Logger.level = 'warn';
      assert.strictEqual((<any>Logger).severityIndex, LoggerSeverityIndex.warn);
      Logger.level = 'error';
      assert.strictEqual((<any>Logger).severityIndex, LoggerSeverityIndex.error);
    });

    it('runs with debug level', () => {
      Logger.level = 'debug';
      Logger.passThru = true;
      const output = stdout.inspectSync(() => {
        Logger.debug('hi');
        Logger.info('hi');
        Logger.warn('hi');
        Logger.error('hi');
      });
      Logger.passThru = false;
      assert.strictEqual(output.length, 4);
      ['debug', 'info', 'warn', 'error'].forEach((key, idx) => {
        assert.strictEqual(cleanupConsoleEscapeSequence(output[idx]), `[${key}] hi\n`);
      });
    });

    it('runs with info level', () => {
      Logger.level = 'info';
      Logger.passThru = true;
      const output = stdout.inspectSync(() => {
        Logger.debug('hi');
        Logger.info('hi');
        Logger.warn('hi');
        Logger.error('hi');
      });
      Logger.passThru = false;
      assert.strictEqual(output.length, 3);
      ['info', 'warn', 'error'].forEach((key, idx) => {
        assert.strictEqual(cleanupConsoleEscapeSequence(output[idx]), `[${key}] hi\n`);
      });
    });

    it('runs with warn level', () => {
      Logger.level = 'warn';
      Logger.passThru = true;
      const output = stdout.inspectSync(() => {
        Logger.debug('hi');
        Logger.info('hi');
        Logger.warn('hi');
        Logger.error('hi');
      });
      Logger.passThru = false;
      assert.strictEqual(output.length, 2);
      ['warn', 'error'].forEach((key, idx) => {
        assert.strictEqual(cleanupConsoleEscapeSequence(output[idx]), `[${key}] hi\n`);
      });
    });

    it('runs with error level', () => {
      Logger.level = 'error';
      Logger.passThru = true;
      const output = stdout.inspectSync(() => {
        Logger.debug('hi');
        Logger.info('hi');
        Logger.warn('hi');
        Logger.error('hi');
      });
      Logger.passThru = false;
      assert.strictEqual(output.length, 1);
      ['error'].forEach((key, idx) => {
        assert.strictEqual(cleanupConsoleEscapeSequence(output[idx]), `[${key}] hi\n`);
      });
    });

    it('fails when non-valid value is assigned', () => {
      assert.throws(() => {
        (<any>Logger).level = 0;
      });
    });
  });

  describe('_handleMessage', () => {
    describe('as a simple one argument', () => {
      it('handles primitive data types (and all becomes string)', () => {
        assert.strictEqual((<any>Logger)['handleMessage'](BigInt(1)), '1');
        assert.strictEqual((<any>Logger)['handleMessage'](true), 'true');
        assert.strictEqual((<any>Logger)['handleMessage'](false), 'false');
        assert.strictEqual((<any>Logger)['handleMessage'](0), '0');
        assert.strictEqual((<any>Logger)['handleMessage'](1), '1');
        assert.strictEqual((<any>Logger)['handleMessage'](-123), '-123');
        assert.strictEqual((<any>Logger)['handleMessage']('hello'), 'hello');
        assert.strictEqual((<any>Logger)['handleMessage'](undefined), 'undefined');
        assert.strictEqual((<any>Logger)['handleMessage'](Symbol('hello')), 'hello');
      });

      it('handles null', () => {
        assert.strictEqual((<any>Logger)['handleMessage'](null), 'null');
      });

      it('handles a simple obj', () => {
        assert.strictEqual((<any>Logger)['handleMessage']({ a: 'b', c: 1 }), '{"a":"b","c":1}');
      });

      it('uses toJSON()', () => {
        const obj = {
          foo: 'bar',
          toJSON: function () {
            return 'json';
          },
          toString: function () {
            return 'string';
          },
        };
        assert.strictEqual((<any>Logger)['handleMessage'](obj), 'json');
      });

      it('uses toString() if it fails on JSON.stringify()', () => {
        const obj = {
          bar: 'baz',
          toString: function () {
            return 'string';
          },
        };
        (<any>obj).circular = obj;
        assert.strictEqual((<any>Logger)['handleMessage'](obj), 'string');
      });

      describe('precedence', () => {
        it('1) toJSON()', () => {
          const obj = {
            toJSON: function () {
              return 'toJSON';
            },
            toString: function () {
              return 'toString';
            },
          };
          assert.strictEqual((<any>Logger)['handleMessage'](obj), 'toJSON');
          const primitive = 2;
          (<any>Number.prototype).toJSON = function () {
            return { value: this.valueOf(), type: 'Number' };
          };
          const primitiveResult = (<any>Logger)['handleMessage'](primitive);
          delete (<any>Number.prototype).toJSON;
          assert.deepEqual(primitiveResult, { value: 2, type: 'Number' });
        });
        it('2) primitive translation (see "handles primitive data types")');
        it('3) JSON.stringify()', () => {
          const obj = {
            toString: function () {
              return 'HAHAHA';
            },
          };
          assert.strictEqual((<any>Logger)['handleMessage'](obj), '{}');
        });
        it('4) toString() (see "uses toString() if it fails on JSON.stringify()")');
      });
    });

    describe('as multiple arguments', () => {
      it('writes a message as multiple args', () => {
        const args = [1, 'hello', true, ['foo'], { bar: 'baz' }];

        const result = (<any>Logger)['handleMessage'](args);
        assert.deepEqual(result, JSON.stringify(args));
      });
    });

    describe('Error object', () => {
      it('writes "Error" construct', () => {
        const error = new Error('Hello');
        const result = JSON.parse((<any>Logger)['handleMessage'](error));
        assert.strictEqual(result.error.class, 'Error');
        assert.strictEqual(result.error.message, 'Hello');
        assert.ok(Array.isArray(result.error.stacktrace));
      });

      it('writes "Error" construct with one extra property', () => {
        const error = new SyntaxError('Extra');
        const result = JSON.parse((<any>Logger)['handleMessage']([error, { foo: 'foo', bar: 'bar' }]));
        assert.strictEqual(result.error.class, 'SyntaxError');
        assert.strictEqual(result.error.message, 'Extra');
        assert.ok(Array.isArray(result.error.stacktrace));
        assert.strictEqual(result.foo, 'foo');
        assert.strictEqual(result.bar, 'bar');
      });

      it('writes "Error" construct with extra properties', () => {
        const error = new RangeError('Extra2');
        const result = JSON.parse((<any>Logger)['handleMessage']([error, { foo: 'foo' }, { bar: 'bar' }]));
        assert.strictEqual(result.error.class, 'RangeError');
        assert.strictEqual(result.error.message, 'Extra2');
        assert.ok(Array.isArray(result.error.stacktrace));
        assert.deepEqual(result[0], { foo: 'foo' });
        assert.deepEqual(result[1], { bar: 'bar' });
      });
    });
  });

  describe('_processQueuedMessages', () => {
    it('processes queued messages', () => {
      (<any>Logger)['logQueue'].push({
        datetime: new Date(0),
        severity: 'debug',
        msg: 'debug0',
      });
      (<any>Logger)['logQueue'].push({
        datetime: new Date(1000),
        severity: 'debug',
        msg: 'debug1',
      });
      const output = stdout.inspectSync(() => {
        (<any>Logger)['processQueuedMessages']();
      });
      assert.deepEqual(output, [
        `[1970-01-01 00:00:00 +0000][${TEST_SRV}][DEBUG][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] debug0\n`,
        `[1970-01-01 00:00:01 +0000][${TEST_SRV}][DEBUG][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] debug1\n`,
      ]);
    });
  });

  describe('_concreteWrite', () => {
    it('writes a message as a single argument', () => {
      const output = stdout.inspectSync(() => {
        const d = new Date(0);
        (<any>Logger)['concreteWrite'](d, 'debug', 'debug');
        (<any>Logger)['concreteWrite'](d, 'info', 'info');
        (<any>Logger)['concreteWrite'](d, 'warn', 'warn');
        (<any>Logger)['concreteWrite'](d, 'error', 'error');
      });
      assert.deepEqual(output, [
        `[1970-01-01 00:00:00 +0000][${TEST_SRV}][DEBUG][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] debug\n`,
        `[1970-01-01 00:00:00 +0000][${TEST_SRV}][INFO][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] info\n`,
        `[1970-01-01 00:00:00 +0000][${TEST_SRV}][WARN][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] warn\n`,
        `[1970-01-01 00:00:00 +0000][${TEST_SRV}][ERROR][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] error\n`,
      ]);
    });
  });
});
