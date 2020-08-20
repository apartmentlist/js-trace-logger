import { Tracer } from 'dd-trace';
import StackUtils from 'stack-utils';
import LogFormatter from './log_formatter';
import { LoggerSeverity } from './constant';

type LoggerSeverityStrings = keyof typeof LoggerSeverity;

interface LogQueue {
  datetime: Date;
  severity: LoggerSeverityStrings;
  msg: any;
}

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
  private static logQueue: Array<LogQueue> = [];
  private static formatter: LogFormatter;
  private static stackUtil: StackUtils = new StackUtils({
    cwd: process.cwd(),
    internals: StackUtils.nodeInternals(),
  });

  static boot(tracer: Tracer, env: string, srv: string, vrs: string) {
    // `Logger.info()` and other methods should still work
    // before `boot()` but it'll start to really writ after
    // DDTrace.Tracer gets properly initilized.
    Logger.formatter = new LogFormatter(tracer, env, srv, vrs);
    Logger.processQueuedMessages();
  }

  static debug(msg: any): void {
    Logger.write('debug', msg);
  }
  static info(msg: any): void {
    Logger.write('info', msg);
  }
  static warn(msg: any): void {
    Logger.write('warn', msg);
  }
  static error(msg: any): void {
    Logger.write('error', msg);
  }

  static convertErrorToJson(err: Error, extra?: ExtraProperty): LoggingError {
    const myStack = err.stack ? err.stack : '';
    const result: LoggingError = {
      error: {
        class: err.constructor.name,
        message: err.message,
        stacktrace: Logger.stackUtil.clean(myStack).trim().split('\n'),
      },
    };
    if (extra) {
      Object.keys(extra).forEach((key) => {
        if (key === 'error') {
          return;
        }
        result[key] = extra[key];
      });
    }
    return result;
  }

  // PRIVATE
  // =======

  private static write(sev: LoggerSeverityStrings, msg: any) {
    const dt: Date = new Date();
    const m: string = Logger.handleMessage(msg);

    if (Logger.formatter) {
      Logger.concreteWrite(dt, sev, m);
    } else {
      Logger.logQueue.push({
        datetime: dt,
        severity: sev,
        msg: msg,
      });
    }
  }

  private static handleMessage(msg: any): string {
    if (msg && typeof msg.toJSON === 'function') {
      return msg.toJSON();
    }
    if (msg instanceof Error) {
      return JSON.stringify(Logger.convertErrorToJson(msg));
    }
    const msgType: string = typeof msg;
    // handle premitive types
    switch (msgType) {
      case 'bigint':
      case 'boolean':
      case 'function':
      case 'number':
      case 'string':
        return msg.toString();
        break;

      case 'undefined':
        return 'undefined';
        break;

      case 'symbol':
        return msg.description;
        break;
    }
    // only `object` should reach here
    try {
      const jsonStr: string = JSON.stringify(msg);
      return jsonStr;
    } catch (err) {
      // failed by JSON.stringify
    }
    try {
      const str: string = msg.toString();
      return str;
    } catch (err) {
      // failed by toString…? how?
    }
    // Not sure how to reach here, but
    return '(could not be processed by Logger::handleMessage())';
  }

  private static processQueuedMessages(): void {
    Logger.logQueue.forEach((q: LogQueue) => {
      Logger.concreteWrite(q.datetime, q.severity, q.msg);
    });
    Logger.logQueue = [];
  }

  private static concreteWrite(dt: Date, sev: LoggerSeverityStrings, msg: string) {
    // if you ever need to write it to a FD,
    // consider using this:
    // https://www.npmjs.com/package/sonic-boom
    console.log(Logger.formatter.format(dt, sev, msg));
  }
}
