import { Tracer } from 'dd-trace';
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
export default class Logger {
    static passThru: boolean;
    private static logQueue;
    private static formatter;
    private static stackUtil;
    static boot(tracer: Tracer, env: string, srv: string, vrs: string): void;
    static debug(...msg: any): void;
    static info(...msg: any): void;
    static warn(...msg: any): void;
    static error(...msg: any): void;
    static convertErrorToJson(err: Error, extra?: ExtraProperty): LoggingError;
    private static write;
    private static handleMessage;
    private static processQueuedMessages;
    private static concreteWrite;
}
export {};
