import { tracer, Tracer, Span, SpanContext } from 'dd-trace';
import { TemplateParam, compileTemplate } from './util';
import { LoggerSeverity, LoggerSeverityString } from './constant';

interface LogFormatterOption {
  env: string;
  service: string;
  version: string;
  progname: string;
  logTemplate: string;
  traceTemplate: string;
  dateFunc: (d: Date) => string;
}

export class LogFormatter {
  private env;
  private service;
  private version;
  private progname;
  private logFunc: (passed: TemplateParam) => string;
  private traceFunc: (passed: TemplateParam) => string;
  private dateFunc: (d: Date) => string;
  private tracer: Tracer;

  constructor(option: LogFormatterOption, passed_tracer?: Tracer) {
    const { env, service, version, progname, logTemplate, traceTemplate, dateFunc } = option;
    this.env = env;
    this.service = service;
    this.version = version;
    this.progname = progname;
    this.logFunc = compileTemplate(logTemplate);
    this.traceFunc = compileTemplate(traceTemplate);
    this.dateFunc = dateFunc;
    this.tracer = passed_tracer || tracer;
  }

  public format(dt: Date, sev: LoggerSeverityString, msg: string): string {
    return this.logFunc({
      datetime: this.dateFunc(dt),
      progname: this.progname,
      severity: LoggerSeverity[sev],
      trace: this.toTraceString(),
      msg: msg,
    });
  }

  private toTraceString(): string {
    const activeSpan: Span | null = this.tracer.scope().active();
    let trace_id = '1';
    let span_id = '1';

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
}
