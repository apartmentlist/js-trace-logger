import * as assert from 'assert';
import * as TestConsole from 'test-console';
import { stubTracerWithoutContext } from './test_util';

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

  describe('_handleMessage', () => {
    it('handles primitive data types', () => {
      assert.strictEqual((<any>Logger)['handleMessage'](BigInt(1)), '1');
      assert.strictEqual((<any>Logger)['handleMessage'](true), 'true');
      assert.strictEqual((<any>Logger)['handleMessage'](false), 'false');
      assert.strictEqual((<any>Logger)['handleMessage'](1), '1');
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
    it('uses toString() if it fails run JSON.stringify()', () => {
      const obj = {
        bar: 'baz',
        toString: function () {
          return 'string';
        },
      };
      (<any>obj).circular = obj;
      assert.strictEqual((<any>Logger)['handleMessage'](obj), 'string');
    });
  });

  it('_processQueuedMessages', () => {
    (<any>Logger)['logQueue'].push({
      datetime: new Date(0),
      severity: 'debug',
      msg: 'debug',
    });
    const output = stdout.inspectSync(() => {
      (<any>Logger)['processQueuedMessages']();
    });
    assert.deepEqual(output, [
      `[1970-01-01 00:00:00 +0000][${TEST_SRV}][DEBUG][dd.env=${TEST_ENV} dd.service=${TEST_SRV} dd.version=${TEST_VRS} dd.trace_id=1 dd.span_id=1] debug\n`,
    ]);
  });

  it('_concreteWrite', () => {
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
