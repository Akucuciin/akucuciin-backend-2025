import mysql from 'mysql2/promise';

import AppConfig from '../configs/app.config.mjs';

const db = mysql.createPool({
  host: AppConfig.DB.host,
  user: AppConfig.DB.user,
  port: AppConfig.DB.port,
  password: AppConfig.DB.password,
  database: AppConfig.DB.database,
});

export default db;
