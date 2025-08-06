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
    const userId = req.user?.id || 'NO_USER';
    const userEmail = req.user?.email || 'NO_EMAIL';
    return `${req.method} ${req.url} completed with status code ${res.statusCode} from user ${userId} (${userEmail})`;
  },
  customProps(req, res) {
    return {
      context: Logger.bindings().context,
      env: Logger.bindings().env,
      userId: req.user?.id || 'NO_USER',
      userEmail: req.user?.email || 'NO_EMAIL',
    };
  },
});

export default pinoMiddleware;
