import { Tracer, Scope, Span, tracer as singleTracerInstance } from 'dd-trace';
import { FakeFactory } from 'tsunit.external';
import { SpanContext as SpanContextClass } from 'opentracing';
import * as Util from 'util';

export const stubTracerWithContext = function (tid: string, sid: string): Tracer {
  const fakeSpan: Span = singleTracerInstance.startSpan('fake');
  fakeSpan.finish();
  const context: SpanContextClass = new SpanContextClass();
  const span: Span = FakeFactory.getFake<Span>(fakeSpan);
  const scope: Scope = FakeFactory.getFake<Scope>(singleTracerInstance.scope);
  const tracer: Tracer = FakeFactory.getFake<Tracer>(singleTracerInstance);
  tracer.scope = function (): Scope {
    return scope;
  };
  scope.active = function (): Span {
    return span;
  };
  span.context = function (): SpanContextClass {
    return context;
  };
  context.toTraceId = function (): string {
    return tid;
  };
  context.toSpanId = function (): string {
    return sid;
  };
  return tracer;
};

export const stubTracerWithoutContext = function (): Tracer {
  const fakeSpan: Span = singleTracerInstance.startSpan('fake');
  fakeSpan.finish();
  const scope: Scope = FakeFactory.getFake<Scope>(singleTracerInstance.scope);
  const tracer: Tracer = FakeFactory.getFake<Tracer>(singleTracerInstance);
  tracer.scope = function (): Scope {
    return scope;
  };
  scope.active = function (): Span | null {
    return null;
  };
  return tracer;
};

const REGEX_ES: RegExp = /\x1B(?:[@-Z\\-_]|\[[0-\?]*[ -\/]*[\@-~])/g;
export const cleanupConsoleEscapeSequence = function (str: string): string {
  return str.replace(REGEX_ES, '');
};

export const inspectStdOutSync = function (cb: Function): Array<string> {
  const result: Array<string> = [];
  const originalStdout = console.log;
  console.log = function (): void {
    const args: Array<any> = [].slice.apply(arguments, [0]);
    result.push(`${Util.formatWithOptions({ colors: false }, '', ...args).trim()}\n`);
  };
  cb();
  console.log = originalStdout;
  return result;
};
