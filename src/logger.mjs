// logger.ts
import dotenv from 'dotenv';
import * as fs from 'fs';
import { join } from 'path';
import pino from 'pino';
import AppConfig from './configs/app.config.mjs';

dotenv.config();

const isProd = AppConfig.Server.dev === 0;
const isLogtailEnabled = AppConfig.LOG.logtailEnabled === 1;
const logLevel = isProd ? 'info' : 'debug';
const logsDir = join(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Base transport targets
const transportTargets = [
  {
    target: 'pino-roll',
    level: logLevel,
    options: {
      file: `${logsDir}/app`,
      extension: 'log',
      frequency: 'daily',
      size: '20m',
      dateFormat: 'yyyy-MM-dd',
    },
  },
  {
    target: 'pino-pretty',
    level: logLevel,
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
];

// Only logtail if in production
if (isLogtailEnabled) {
  transportTargets.unshift({
    target: '@logtail/pino',
    level: logLevel,
    options: {
      sourceToken: AppConfig.LOG.logtailSourceToken,
      options: { endpoint: AppConfig.LOG.logtailEndpoint },
    },
  });
}

const Logger = pino({
  level: 'trace',
  base: {
    context: `[Akucuciin ${isProd ? 'Production' : 'Development'}]`,
    env: isProd ? 'production' : 'development',
  },
  transport: {
    targets: transportTargets,
  },
});

export default Logger;
