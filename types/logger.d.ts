import { Tracer } from 'dd-trace';
import { LoggerSeverityString } from './constant';
interface LoggingError {
    error: ErrorObject;
    [key: string]: any;
}
interface ErrorObject {
    class: string;
    message: string;
    stacktrace: Array<string>;
}
interface ExtraProperty {
    [key: string]: any;
}
interface LoggerOption {
    env: string;
    service: string;
    version: string;
    progname?: string;
    logTemplate?: string;
    traceTemplate?: string;
    dateFunc?: (d: Date) => string;
}
export default class Logger {
    /**
     * Skip TraceID decoration, if it's true
     */
    static passThru: boolean;
    private static _dateFunc;
    private static _env;
    private static _level;
    private static _logTemplate;
    private static _progname;
    private static _service;
    private static _tracer;
    private static _traceTemplate;
    private static _version;
    private static formatter;
    private static logQueue;
    private static severityIndex;
    private static stackUtil;
    /**
     * function to generate a string out of Date object
     */
    static get dateFunc(): (d: Date) => string;
    static set dateFunc(func: (d: Date) => string);
    /**
     * DD_ENV
     */
    static get env(): string;
    static set env(str: string);
    /**
     * LOG_LEVEL
     */
    static get level(): LoggerSeverityString;
    static set level(l: LoggerSeverityString);
    /**
     * template to generate a whole log line
     */
    static get logTemplate(): string;
    static set logTemplate(str: string);
    /**
     * progname ~= DD_SERVICE; unless you set it specifically
     */
    static get progname(): string;
    static set progname(str: string);
    /**
     * DD_SERVICE
     */
    static get service(): string;
    static set service(str: string);
    /**
     * Curently only Datadog Tracer
     */
    static get tracer(): Tracer;
    static set tracer(tracer: Tracer);
    /**
     * template to generate dd_trace string
     */
    static get traceTemplate(): string;
    static set traceTemplate(str: string);
    /**
     * DD_VERSION
     */
    static get version(): string;
    static set version(str: string);
    /**
     * Start to output log after boot()
     */
    static boot(tracer: Tracer, option: LoggerOption): void;
    /**
     * console.log() compatible, but decorated with Trace ID and
     * Serverity of DEBUG.
     *
     * Any object is accepted as msg, and it will try to make JSON
     * string out of it. If the first agument is an instance of Error,
     * it will try to create error construct.
     *
     * @param ...msg - Any message
     */
    static debug(...msg: Array<any>): void;
    /**
     * console.log() compatible, but decorated with Trace ID and
     * Serverity of INFO.
     *
     * Any object is accepted as msg, and it will try to make JSON
     * string out of it. If the first agument is an instance of Error,
     * it will try to create error construct.
     *
     * @param ...msg - Any message
     */
    static info(...msg: Array<any>): void;
    /**
     * console.log() compatible, but decorated with Trace ID and
     * Serverity of WARNING.
     *
     * Any object is accepted as msg, and it will try to make JSON
     * string out of it. If the first agument is an instance of Error,
     * it will try to create error construct.
     *
     * @param ...msg - Any message
     */
    static warn(...msg: Array<any>): void;
    /**
     * console.log() compatible, but decorated with Trace ID and
     * Serverity of ERROR.
     *
     * Any object is accepted as msg, and it will try to make JSON
     * string out of it. If the first agument is an instance of Error,
     * it will try to create error construct.
     *
     * @param ...msg - Any message
     */
    static error(...msg: Array<any>): void;
    /**
     * Convert an error instance to JSON Error construct
     *
     * @param err - Capturing Error instance
     * @param extra - Object that you want to add to the JSON Error
     *                construct
     */
    static convertErrorToJson(err: Error, extra?: ExtraProperty): LoggingError;
    private static updateFormatter;
    private static write;
    private static handleMessage;
    private static processQueuedMessages;
    private static concreteWrite;
}
export {};
