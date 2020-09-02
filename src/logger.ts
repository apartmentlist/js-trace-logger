import { Tracer } from 'dd-trace';
import StackUtils from 'stack-utils';
import LogFormatter from './log_formatter';
import { LoggerSeverityString, LoggerSeverityRuntimeOption, LoggerSeverityIndex } from './constant';

interface LogQueue {
  datetime: Date;
  severity: LoggerSeverityString;
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

const LoggerDefaultSeverity: LoggerSeverityString = 'info';

export default class Logger {
  public static passThru = false;

  private static logQueue: Array<LogQueue> = [];
  private static formatter: LogFormatter;
  private static stackUtil: StackUtils = new StackUtils({
    cwd: process.cwd(),
    internals: StackUtils.nodeInternals(),
  });
  private static severityIndex: number = LoggerSeverityIndex[LoggerDefaultSeverity];
  private static _level: LoggerSeverityString = LoggerDefaultSeverity;

  static get level(): LoggerSeverityString {
    return Logger._level;
  }

  static set level(l: LoggerSeverityString) {
    const key: LoggerSeverityString = LoggerSeverityRuntimeOption[l];
    if (key) {
      Logger._level = key;
      Logger.severityIndex = LoggerSeverityIndex[key];
    } else {
      throw new TypeError(
        `invalid argument: Logger.level should be one of ${JSON.stringify(
          Object.values(LoggerSeverityRuntimeOption)
        )} but got "${l}"`
      );
    }
  }

  static boot(tracer: Tracer, env: string, srv: string, vrs: string): void {
    // `Logger.info()` and other methods should still work
    // before `boot()` but it'll start to really writ after
    // DDTrace.Tracer gets properly initilized.
    Logger.formatter = new LogFormatter(tracer, env, srv, vrs);
    Logger.processQueuedMessages();
  }

  static debug(...msg: Array<any>): void {
    Logger.write('debug', msg);
  }
  static info(...msg: Array<any>): void {
    Logger.write('info', msg);
  }
  static warn(...msg: Array<any>): void {
    Logger.write('warn', msg);
  }
  static error(...msg: Array<any>): void {
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

  private static write(sev: LoggerSeverityString, msg: Array<any>) {
    const messageSevIndex = LoggerSeverityIndex[sev];
    if (Logger.severityIndex < messageSevIndex) {
      return;
    }
    if (Logger.passThru) {
      const arg: Array<any> = [`[${sev}]`].concat(msg);
      console.log.call(console, ...arg);
      return;
    }

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

  private static handleMessage(_msg: Array<any> | null): string {
    let msg: any;

    if (_msg === null || _msg === undefined) {
      msg = _msg;
    } else if (_msg.length && _msg.length === 1) {
      msg = _msg[0];
    } else {
      msg = _msg;
    }

    if (msg instanceof Error) {
      return JSON.stringify(Logger.convertErrorToJson(msg));
    }
    if (Array.isArray(msg) && msg[0] instanceof Error) {
      let arg;
      if (msg.length === 2) {
        arg = msg[1];
      } else {
        arg = msg.slice(1);
      }
      return JSON.stringify(Logger.convertErrorToJson(msg[0], arg));
    }
    if (msg && typeof msg.toJSON === 'function') {
      return msg.toJSON();
    }
    const msgType: string = typeof msg;
    // handle premitive types
    switch (msgType) {
      case 'bigint':
      case 'function':
      case 'string':
        return msg.toString();
        break;

      case 'boolean':
      case 'number':
        // these still should be string because:
        // 1) TypeScript type suggests,
        // 2) also you want it to keep its type when
        //    it goes as JSON-string, which it will be.
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

  private static concreteWrite(dt: Date, sev: LoggerSeverityString, msg: string) {
    // if you ever need to write it to a FD,
    // consider using this:
    // https://www.npmjs.com/package/sonic-boom
    console.log(Logger.formatter.format(dt, sev, msg));
  }
}
