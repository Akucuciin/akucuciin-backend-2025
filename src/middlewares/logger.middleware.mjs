// logger.middleware.ts
import pinoHttp from 'pino-http';
import Logger from '../logger.mjs';

const pinoMiddleware = pinoHttp({
  logger: Logger,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[REDACTED]',
  },
  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'silent';
    return 'info';
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed with status code ${res.statusCode}`;
  },
  customProps() {
    return {
      context: Logger.bindings().context,
      env: Logger.bindings().env,
    };
  },
});

export default pinoMiddleware;
