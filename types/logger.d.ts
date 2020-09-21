import { Tracer } from 'dd-trace';
import { LoggerSeverityString } from './constant';
interface ErrorLogConstruct {
    error: {
        class: string;
        message: string;
        stacktrace: Array<string>;
    };
    [key: string]: any;
}
interface ExtraProperty {
    [key: string]: any;
}
export interface LoggerOption {
    env: string;
    service: string;
    version: string;
    progname?: string;
    logTemplate?: string;
    traceTemplate?: string;
    dateFunc?: (d: Date) => string;
}
export { LoggerSeverityString } from './constant';
export { compileTemplate, extractParams, formatUTCDateRuby } from './util';
export declare class Logger {
    /**
     * It skips TraceID decoration if it's true (Default false)
     */
    static passThru: boolean;
    private static _dateFunc;
    private static _env;
    private static _level;
    private static _logTemplate;
    private static _progname;
    private static _service;
    private static _traceTemplate;
    private static _version;
    private static formatter;
    private static severityIndex;
    private static stackUtil;
    /**
     * Followings are getter functions for private properties. I don't
     * really find a good reason to switch these values EXCEPT log
     * level in runtime, so I removed setter functions
     */
    /**
     * function to generate a string out of Date object
     */
    static get dateFunc(): (d: Date) => string;
    /**
     * DD_ENV
     */
    static get env(): string;
    /**
     * LOG_LEVEL
     */
    static get level(): LoggerSeverityString;
    static set level(l: LoggerSeverityString);
    /**
     * template to generate a whole log line
     */
    static get logTemplate(): string;
    /**
     * progname ~= DD_SERVICE; unless you set it specifically
     */
    static get progname(): string;
    /**
     * DD_SERVICE
     */
    static get service(): string;
    /**
     * template to generate dd_trace string
     */
    static get traceTemplate(): string;
    /**
     * DD_VERSION
     */
    static get version(): string;
    static configure(option: LoggerOption, tracer?: Tracer): void;
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
    static convertErrorToJson(err: Error, extra?: ExtraProperty): ErrorLogConstruct;
    private static write;
    private static handleMessage;
    private static concreteWrite;
    private static passThruWrite;
}
