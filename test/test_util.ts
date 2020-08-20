import { Tracer, Scope, Span, tracer as singleTracerInstance } from 'dd-trace';
import { FakeFactory } from 'tsunit.external';
import { SpanContext as SpanContextClass } from 'opentracing';

export const stubTracerWithContext = function (tid: string, sid: string): Tracer {
  const fakeSpan = singleTracerInstance.startSpan('fake');
  fakeSpan.finish();
  const context = new SpanContextClass();
  const span = FakeFactory.getFake<Span>(fakeSpan);
  const scope = FakeFactory.getFake<Scope>(singleTracerInstance.scope);
  const tracer = FakeFactory.getFake<Tracer>(singleTracerInstance);
  tracer.scope = function () {
    return scope;
  };
  scope.active = function () {
    return span;
  };
  span.context = function () {
    return context;
  };
  context.toTraceId = function () {
    return tid;
  };
  context.toSpanId = function () {
    return sid;
  };
  return tracer;
};

export const stubTracerWithoutContext = function (): Tracer {
  const fakeSpan = singleTracerInstance.startSpan('fake');
  fakeSpan.finish();
  const scope = FakeFactory.getFake<Scope>(singleTracerInstance.scope);
  const tracer = FakeFactory.getFake<Tracer>(singleTracerInstance);
  tracer.scope = function () {
    return scope;
  };
  scope.active = function () {
    return null;
  };
  return tracer;
};
