import { Tracer, Span, SpanContext } from 'dd-trace';
import { compileTemplate } from './util';
import { LoggerSeverity } from './constant';

type LoggerSeverityStrings = keyof typeof LoggerSeverity;

export default class LogFormatter {
  public env: string = 'development';
  public service: string = 'logger';
  public version: string = 'unknown';

  private tracer: Tracer;
  private template: string = '[${datetime}][${service}][${severity}][${trace}] ${msg}';
  private templateFunc: Function;
  private traceFunc: Function = compileTemplate(
    'dd.env=${env} dd.service=${service} dd.version=${version} dd.trace_id=${trace_id} dd.span_id=${span_id}'
  );

  constructor(trc: Tracer, env: string, srv: string, vrs: string, tpl?: string) {
    this.tracer = trc;
    this.env = env;
    this.service = srv;
    this.version = vrs;

    if (tpl) {
      this.template = tpl;
      this.templateFunc = compileTemplate(tpl);
    } else {
      this.templateFunc = compileTemplate(this.template);
    }
  }

  public format(dt: Date, sev: LoggerSeverityStrings, msg: string): string {
    return this.templateFunc({
      datetime: this.convertDateForDatadog(dt),
      service: this.service,
      severity: LoggerSeverity[sev],
      trace: this.toTraceString(),
      msg: msg,
    });
  }

  private toTraceString(): string {
    const activeSpan: Span | null = this.tracer.scope().active();
    let trace_id: string = '1';
    let span_id: string = '1';

    if (activeSpan) {
      const context: SpanContext = activeSpan.context();
      trace_id = context.toTraceId();
      span_id = context.toSpanId();
    }
    return this.traceFunc({
      env: this.env,
      service: this.service,
      version: this.version,
      trace_id: trace_id,
      span_id: span_id,
    });
  }

  private convertDateForDatadog(d: Date): string {
    // '2020-05-13 18:01:16 +0000'
    const year = d.getUTCFullYear();
    const month = `0${d.getUTCMonth() + 1}`.slice(-2);
    const day = `0${d.getUTCDate()}`.slice(-2);
    const hour = `0${d.getUTCHours()}`.slice(-2);
    const minutes = `0${d.getUTCMinutes()}`.slice(-2);
    const seconds = `0${d.getUTCSeconds()}`.slice(-2);
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds} +0000`;
  }
}
