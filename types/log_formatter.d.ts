import { Tracer } from 'dd-trace';
import { LoggerSeverity } from './constant';
declare type LoggerSeverityStrings = keyof typeof LoggerSeverity;
export default class LogFormatter {
    env: string;
    service: string;
    version: string;
    private tracer;
    private template;
    private templateFunc;
    private traceFunc;
    constructor(trc: Tracer, env: string, srv: string, vrs: string, tpl?: string);
    format(dt: Date, sev: LoggerSeverityStrings, msg: string): string;
    private toTraceString;
    private convertDateForDatadog;
}
export {};
