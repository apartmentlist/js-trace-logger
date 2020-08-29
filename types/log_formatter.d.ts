import { Tracer } from 'dd-trace';
import { LoggerSeverityString } from './constant';
export default class LogFormatter {
    env: string;
    service: string;
    version: string;
    private tracer;
    private template;
    private templateFunc;
    private traceFunc;
    constructor(trc: Tracer, env: string, srv: string, vrs: string, tpl?: string);
    format(dt: Date, sev: LoggerSeverityString, msg: string): string;
    private toTraceString;
    private convertDateForDatadog;
}
