const LoggerService = require('../services/loggerService');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  LoggerService.http(`${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const level = statusCode >= 400 ? 'warn' : 'info';

    LoggerService.log(level, `${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
    });
  });

  next();
};

module.exports = requestLogger;
