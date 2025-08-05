import app from './app.mjs';
import AppConfig from './configs/app.config.mjs';
import Logger from './logger.mjs';

AppConfig.Server.dev === 1
  ? Logger.info(AppConfig)
  : Logger.info('AppConfig loaded in production mode');

app.listen(process.env.PORT, () => {
  Logger.info(
    `Server is running on port ${process.env.PORT} in ${AppConfig.Server.dev === 1 ? 'development' : 'production'} mode`
  );
});
