import { instance, mock, when } from 'ts-mockito';
import { Tracer, Scope, Span, tracer as singleTracerInstance } from 'dd-trace';
import { FakeFactory } from 'tsunit.external';
import { SpanContext as SpanContextClass, Span as SpanClass } from 'opentracing';
import * as Util from 'util';

export const stubTracerWithContext = function (tid: string, sid: string): Tracer {
  const mockedContext: SpanContextClass = mock(SpanContextClass);
  when(mockedContext.toTraceId()).thenCall(() => {
    return tid;
  });
  when(mockedContext.toSpanId()).thenCall(() => {
    return sid;
  });
  const context: SpanContextClass = instance(mockedContext);

  const mockedSpan: Span = mock(SpanClass);
  when(mockedSpan.context()).thenCall(() => {
    return context;
  });
  const span = instance(mockedSpan);

  const scope: Scope = FakeFactory.getFake<Scope>(singleTracerInstance.scope);
  scope.active = function (): Span {
    return span;
  };

  const tracer: Tracer = FakeFactory.getFake<Tracer>(singleTracerInstance);
  tracer.scope = function (): Scope {
    return scope;
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
