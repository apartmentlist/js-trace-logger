import * as assert from 'assert';
import LogFormatter from '../src/log_formatter';
import { stubTracerWithContext, stubTracerWithoutContext } from './test_util';

describe('LogFormatter', () => {
  it('format with an active context', () => {
    const env = 'testing';
    const service = 'dd-logger';
    const version = '0xbeaf';
    const dt = new Date(0);
    const sev = 'info';
    const msg = 'hello world';
    const tid = '1234567890';
    const sid = '0987654321';
    const stubTracer = stubTracerWithContext(tid, sid);

    const li = new LogFormatter(stubTracer, env, service, version);

    assert.strictEqual(li.env, env);
    assert.strictEqual(li.service, service);
    assert.strictEqual(li.version, version);

    assert.strictEqual(
      li.format(dt, sev, msg),
      `[1970-01-01 00:00:00 +0000][${service}][INFO][dd.env=${env} dd.service=${service} dd.version=${version} dd.trace_id=${tid} dd.span_id=${sid}] ${msg}`
    );
  });

  it('format withount a context', () => {
    const env = 'testing';
    const service = 'dd-logger';
    const version = '0xbeaf';
    const dt = new Date(0);
    const sev = 'info';
    const msg = 'hello world';
    const stubTracer = stubTracerWithoutContext();

    const li = new LogFormatter(stubTracer, env, service, version);

    assert.strictEqual(li.env, env);
    assert.strictEqual(li.service, service);
    assert.strictEqual(li.version, version);

    assert.strictEqual(
      li.format(dt, sev, msg),
      `[1970-01-01 00:00:00 +0000][${service}][INFO][dd.env=${env} dd.service=${service} dd.version=${version} dd.trace_id=1 dd.span_id=1] ${msg}`
    );
  });
});
