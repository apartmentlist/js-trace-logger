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
export declare class LogFormatter {
    private env;
    private service;
    private version;
    private progname;
    private logFunc;
    private traceFunc;
    private dateFunc;
    private tracer;
    constructor(option: LogFormatterOption, passed_tracer?: Tracer);
    format(dt: Date, sev: LoggerSeverityString, msg: string): string;
    private toTraceString;
}
export {};
