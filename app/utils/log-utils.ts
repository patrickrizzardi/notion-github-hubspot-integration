import os from 'os';
import type { TransformableInfo } from 'logform';
import { addColors, createLogger, format, transports } from 'winston';
import DatadogWinston from 'datadog-winston';

/**
 * Logging levels in winston conform to the severity ordering specified by RFC5424: severity of all levels is assumed to
 *  be numerically ascending from most important to least important.
 */
enum LogLevel {
  CRITICAL = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
}

enum LogColor {
  CRITICAL = 'bold white redBG',
  ERROR = 'bold red',
  WARN = 'bold yellow',
  INFO = 'bold cyan',
}

interface Transports {
  console: transports.ConsoleTransportInstance;
  file: transports.FileTransportInstance;
  datadog: DatadogWinston;
}

/**
 * Define the levels that winston will use. This is used later on
 * when we create the logger
 */
const logLevels = {
  critical: LogLevel.CRITICAL,
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
};

/**
 * This lets us add custom logging levels and colors so that
 * winston recognizes them
 */
addColors({
  critical: LogColor.CRITICAL,
  error: LogColor.ERROR,
  warn: LogColor.WARN,
  info: LogColor.INFO,
});

/**
 * This is the format that will be used for all logs except File logs
 */
const formatter = format.combine(
  /** Adds color to the format */
  format.colorize(),

  /** Adds timestamp to the format */
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

  /** Format the way the log is output to the console */
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, ...meta } = info;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let { message } = info;

    if (Object.keys(meta).length > 1) {
      delete meta.message;
      message = `${message} \n${JSON.stringify(meta, null, 2)}`;
    }

    return `${timestamp} [${level}]: ${message}`;
  }),
);

/**
 * This is the format that will be used for all File logs
 * The only difference is that we don't want to add color because it will mess up the log file
 */
const fileFormatter = format.combine(
  /** Adds timestamp to the format */
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

  /** Format the way the log is output to the console */
  format.printf((info: TransformableInfo) => {
    const { timestamp, level, ...meta } = info;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let { message } = info;

    if (Object.keys(meta).length > 1) {
      delete meta.message;
      message = `${message} \n${JSON.stringify(meta, null, 2)}`;
    }

    return `${timestamp} [${level}]: ${message}`;
  }),
);

/** ======================================== Defineing Transports ============================================ */
const transporters: Transports = {
  console: new transports.Console({
    format: formatter,
  }),
  file: new transports.File({
    filename: Bun.env.LOG_FILE ?? `./storage/logs/app.log`,
    format: fileFormatter,
  }),
  datadog: new DatadogWinston({
    apiKey: Bun.env.DATADOG_API_KEY,
    ddsource: 'nodejs',
    ddtags: `env:${Bun.env.NODE_ENV}`,
    service: `${Bun.env.NODE_ENV} ${Bun.env.APP_NAME}`,
    hostname: os.hostname(),
  }),
};

/**
 * Create the local logger. We include the console transport only and
 * include all levels since this is only intended for development
 */
// eslint-disable-next-line import/no-mutable-exports
let log = createLogger({ level: 'info', transports: transporters.console, levels: logLevels });

const transportsToUse = [];
for (const transport of Bun.env.LOG_TRANSPORTS.split(',')) {
  switch (transport) {
    case 'console':
      transportsToUse.push(transporters.console);
      break;
    case 'file':
      transportsToUse.push(transporters.file);
      break;
    case 'datadog':
      transportsToUse.push(transporters.datadog);
      break;
    default:
      transportsToUse.push(transporters.console);
      break;
  }
}

log = createLogger({
  level: Bun.env.LOG_LEVEL ?? 'info',
  transports: transportsToUse,
  levels: logLevels,
});

export default log;
