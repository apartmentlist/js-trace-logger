export declare enum LoggerSeverity {
    error = "ERROR",
    warn = "WARN",
    info = "INFO",
    debug = "DEBUG"
}
export declare type LoggerSeverityString = keyof typeof LoggerSeverity;
interface LoggerSeverityRuntimeOptionInterface {
    [key: string]: LoggerSeverityString;
}
interface LoggerSeverityIndexInterface {
    [key: string]: number;
}
export declare const LoggerSeverityRuntimeOption: LoggerSeverityRuntimeOptionInterface;
export declare const LoggerSeverityIndex: LoggerSeverityIndexInterface;
export {};
