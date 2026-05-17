import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const transport = new DailyRotateFile({
  filename: 'logs/system-%DATE%.log',
  datePattern: 'YYYY-MM',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '3',
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [transport, new winston.transports.Console()],
});

export default logger;
