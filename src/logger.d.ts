import { Tracer } from 'dd-trace';

interface ErrorObject {
  class: string;
  message: string;
  stacktrace: Array<string>;
}

interface LoggingError {
  error: ErrorObject;
  [key: string]: any;
}

export declare class Logger {
  static boot(tracer: Tracer, env: string, srv: string, vrs: string): void;
  static debug(msg: any): void;
  static info(msg: any): void;
  static warn(msg: any): void;
  static error(msg: any): void;
  static convertErrorToJson(err: Error, extra?: any): LoggingError;
}
