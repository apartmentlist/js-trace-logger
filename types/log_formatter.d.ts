import { Tracer } from 'dd-trace';
import { LoggerSeverityString } from './constant';
interface LogFormatterOption {
    env: string;
    service: string;
    version: string;
    progname: string;
    logTemplate: string;
    traceTemplate: string;
    dateFunc: (d: Date) => string;
}
export default class LogFormatter {
    private tracer;
    private env;
    private service;
    private version;
    private progname;
    private logFunc;
    private traceFunc;
    private dateFunc;
    constructor(tracer: Tracer, option: LogFormatterOption);
    format(dt: Date, sev: LoggerSeverityString, msg: string): string;
    private toTraceString;
}
export {};
