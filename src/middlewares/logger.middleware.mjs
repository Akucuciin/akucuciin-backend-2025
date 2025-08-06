// logger.middleware.ts
import pinoHttp from 'pino-http';
import Logger from '../logger.mjs';

function attachStartTime(req, res, next) {
  req._startAt = process.hrtime();
  next();
}

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
    let durationMs = '0.00';
    if (Array.isArray(req._startAt)) {
      const [s, ns] = process.hrtime(req._startAt);
      durationMs = (s * 1e3 + ns / 1e6).toFixed(2);
    }

    return {
      context: Logger.bindings().context,
      env: Logger.bindings().env,
      userId: req.user?.id || 'NO_USER',
      userEmail: req.user?.email || 'NO_EMAIL',
      duration: `${durationMs} ms`,
      ip: req.ip,
    };
  },
});

export default [attachStartTime, pinoMiddleware];
