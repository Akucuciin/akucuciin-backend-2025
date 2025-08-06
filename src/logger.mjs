// logger.ts
import dotenv from 'dotenv';
import * as fs from 'fs';
import { join } from 'path';
import pino from 'pino';
import AppConfig from './configs/app.config.mjs';

dotenv.config();

const logLevel = AppConfig.Server.dev === 0 ? 'info' : 'debug';
const logsDir = join(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const Logger = pino({
  level: 'trace',
  base: {
    context: `[Akucuciin ${AppConfig.Server.dev === 1 ? 'Development' : 'Production'}]`,
    env: AppConfig.Server.dev === 1 ? 'development' : 'production',
  },
  transport: {
    targets: [
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
    ],
  },
});

export default Logger;
