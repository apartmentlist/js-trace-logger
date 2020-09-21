import { Tracer } from 'dd-trace';
import StackUtils from 'stack-utils';
import { LogFormatter } from './log_formatter';
import { LoggerSeverityString, LoggerSeverityRuntimeOption, LoggerSeverityIndex } from './constant';
import { formatUTCDateRuby } from './util';

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

const LoggerDefaultSeverity: LoggerSeverityString = 'info';

export { LoggerSeverityString } from './constant';
export { compileTemplate, extractParams, formatUTCDateRuby } from './util';
export class Logger {
  /**
   * It skips TraceID decoration if it's true (Default false)
   */
  public static passThru = false;

  // See GETTER section for underscore private properties
  private static _dateFunc: (d: Date) => string = formatUTCDateRuby;
  private static _env = 'development';
  private static _level: LoggerSeverityString = LoggerDefaultSeverity;
  private static _logTemplate = '[${datetime}][${progname}][${severity}][${trace}] ${msg}';
  private static _progname = 'logger';
  private static _service = 'logger';
  private static _traceTemplate =
    'dd.env=${env} dd.service=${service} dd.version=${version} dd.trace_id=${trace_id} dd.span_id=${span_id}';
  private static _version = 'unknown';

  private static formatter: LogFormatter;
  private static severityIndex: number = LoggerSeverityIndex[LoggerDefaultSeverity];
  private static stackUtil: StackUtils = new StackUtils({
    cwd: process.cwd(),
    internals: StackUtils.nodeInternals(),
  });

  /**
   * Followings are getter functions for private properties. I don't
   * really find a good reason to switch these values EXCEPT log
   * level in runtime, so I removed setter functions
   */

  /**
   * function to generate a string out of Date object
   */
  static get dateFunc(): (d: Date) => string {
    return Logger._dateFunc;
  }

  /**
   * DD_ENV
   */
  static get env(): string {
    return Logger._env;
  }

  /**
   * LOG_LEVEL
   */
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

  /**
   * template to generate a whole log line
   */
  static get logTemplate(): string {
    return Logger._logTemplate;
  }

  /**
   * progname ~= DD_SERVICE; unless you set it specifically
   */
  static get progname(): string {
    return Logger._progname;
  }

  /**
   * DD_SERVICE
   */
  static get service(): string {
    return Logger._service;
  }

  /**
   * template to generate dd_trace string
   */
  static get traceTemplate(): string {
    return Logger._traceTemplate;
  }

  /**
   * DD_VERSION
   */
  static get version(): string {
    return Logger._version;
  }

  // PUBLIC methods
  // ==============

  static configure(option: LoggerOption, tracer?: Tracer): void {
    const { env, service, version, progname, logTemplate, traceTemplate, dateFunc } = option;
    Logger._env = env;
    Logger._service = service;
    Logger._version = version;
    Logger._progname = progname ? progname : service;
    if (logTemplate) {
      Logger._logTemplate = logTemplate;
    }
    if (traceTemplate) {
      Logger._traceTemplate = traceTemplate;
    }
    if (dateFunc) {
      Logger._dateFunc = dateFunc;
    }
    Logger.formatter = new LogFormatter(
      {
        env: Logger._env,
        service: Logger._service,
        version: Logger._version,
        progname: Logger._progname,
        logTemplate: Logger._logTemplate,
        traceTemplate: Logger._traceTemplate,
        dateFunc: Logger._dateFunc,
      },
      tracer
    );
  }

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
  static debug(...msg: Array<any>): void {
    Logger.write('debug', msg);
  }

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
  static info(...msg: Array<any>): void {
    Logger.write('info', msg);
  }

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
  static warn(...msg: Array<any>): void {
    Logger.write('warn', msg);
  }

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
  static error(...msg: Array<any>): void {
    Logger.write('error', msg);
  }

  /**
   * Convert an error instance to JSON Error construct
   *
   * @param err - Capturing Error instance
   * @param extra - Object that you want to add to the JSON Error
   *                construct
   */

  static convertErrorToJson(err: Error, extra?: ExtraProperty): ErrorLogConstruct {
    const myStack = err.stack ? err.stack : '';
    const result: ErrorLogConstruct = {
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

  // PRIVATE methods
  // ===============

  private static write(sev: LoggerSeverityString, msg: Array<any>) {
    const messageSevIndex = LoggerSeverityIndex[sev];
    if (Logger.severityIndex < messageSevIndex) {
      return;
    }
    if (Logger.passThru) {
      Logger.passThruWrite(sev, msg);
      return;
    }
    if (!Logger.formatter) {
      Logger.passThruWrite(sev, msg);
      return;
    }

    const dt: Date = new Date();
    const m: string = Logger.handleMessage(msg);
    Logger.concreteWrite(dt, sev, m);
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

  private static concreteWrite(dt: Date, sev: LoggerSeverityString, msg: string) {
    // if you ever need to write it to a FD, consider this:
    // https://www.npmjs.com/package/sonic-boom
    console.log(Logger.formatter.format(dt, sev, msg));
  }

  private static passThruWrite(sev: LoggerSeverityString, msg: Array<any>) {
    const args = [`[${sev}]`].concat(msg);
    console.log.call(console, ...args);
  }
}
