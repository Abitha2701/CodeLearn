const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console(),

    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'error.log'),
      level: 'error',
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'all.log'),
    }),
  ],
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class LoggerService {
  static logRequest(req, res, next) {
    const start = Date.now();

    // Log request
    logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const level = statusCode >= 400 ? 'warn' : 'info';

      logger.log(level, `${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`);
    });

    next();
  }

  static logError(error, req = null, res = null) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      url: req?.originalUrl,
      method: req?.method,
      ip: req?.ip,
      userAgent: req?.get('User-Agent'),
      body: req?.body,
      params: req?.params,
      query: req?.query,
    };

    logger.error('Error occurred:', errorInfo);
  }

  static logAuth(action, userId = null, details = {}) {
    logger.info(`Auth ${action}`, { userId, ...details });
  }

  static logQuiz(action, details = {}) {
    logger.info(`Quiz ${action}`, details);
  }

  static logProgress(action, details = {}) {
    logger.info(`Progress ${action}`, details);
  }

  static logCache(action, details = {}) {
    logger.debug(`Cache ${action}`, details);
  }

  static logML(action, details = {}) {
    logger.info(`ML ${action}`, details);
  }

  // Convenience methods
  static error(message, meta = {}) {
    logger.error(message, meta);
  }

  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  static http(message, meta = {}) {
    logger.http(message, meta);
  }

  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }
}

module.exports = LoggerService;
