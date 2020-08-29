// https://tools.ietf.org/html/rfc5424
enum SysLogSeverity {
  EMERG,
  ALERT,
  CRIT,
  ERROR,
  WARN,
  NOTICE,
  INFO,
  DEBUG,
}

export enum LoggerSeverity {
  error = 'ERROR',
  warn = 'WARN',
  info = 'INFO',
  debug = 'DEBUG',
}

export type LoggerSeverityString = keyof typeof LoggerSeverity;

interface LoggerSeverityRuntimeOptionInterface {
  [key: string]: LoggerSeverityString;
}

interface LoggerSeverityIndexInterface {
  [key: string]: number;
}

export const LoggerSeverityRuntimeOption: LoggerSeverityRuntimeOptionInterface = {};

export const LoggerSeverityIndex: LoggerSeverityIndexInterface = {};

(Object.keys(LoggerSeverity) as Array<LoggerSeverityString>).forEach((key: LoggerSeverityString) => {
  const serverityString: string = LoggerSeverity[key];
  const idx: number = SysLogSeverity[serverityString];
  LoggerSeverityIndex[key as string] = idx;
  LoggerSeverityRuntimeOption[key as string] = key;
  LoggerSeverityRuntimeOption[serverityString] = key;
});
