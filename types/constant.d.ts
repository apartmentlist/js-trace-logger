export declare enum LoggerSeverity {
    error = "ERROR",
    warn = "WARN",
    info = "INFO",
    debug = "DEBUG"
}
/**
 * This is the type for LoggerSeverity, meaning it will ensure that
 * the designated variable is one of four keys of "LoggerSeverity."
 */
export declare type LoggerSeverityString = keyof typeof LoggerSeverity;
interface LoggerSeverityRuntimeOptionInterface {
    [key: string]: LoggerSeverityString;
}
interface LoggerSeverityIndexInterface {
    [key: string]: number;
}
/**
 * Logger.level can be changed on runtime. And this is a utility
 * dictionary object for getting the key of "LoggerSeverity." For
 * example, both "warn" and "WARN" will return "warn."
 */
export declare const LoggerSeverityRuntimeOption: LoggerSeverityRuntimeOptionInterface;
/**
 * This is also a utility dictionary and holds "key" as a key of
 * LoggerSeverity and "value" as an index value corresponding to
 * SysLogSeverity.
 */
export declare const LoggerSeverityIndex: LoggerSeverityIndexInterface;
export {};
