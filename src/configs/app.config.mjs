const isDevelopment = Number(process.env.DEV);

const AppConfig = {
  Server: {
    dev: Number(process.env.DEV),
    port: process.env.PORT,
    corsBase: process.env.CORS_BASE,
  },
  DB: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  JWT: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    accessTokenMaxAge: Number(process.env.JWT_MAX_AGE),
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    registerSecret: process.env.JWT_REGISTER_SECRET,
    verifyRegisterMaxAge: Number(process.env.VERIFY_MAX_AGE),
    resetPasswordSecret: process.env.JWT_RESET_PASSWORD_SECRET,
    resetPasswordMaxAge: Number(process.env.RESET_PASSWORD_MAX_AGE),
  },
  MAILER: {
    smtpHost: process.env.MAILER_SMTP_HOST,
    smtpName: process.env.MAILER_SMTP_NAME,
    sender: process.env.MAILER_SENDER,
    email: process.env.MAILER_EMAIL,
    password: process.env.MAILER_PASSWORD,
  },
  URL: {
    verifyEmailSuccess: isDevelopment
      ? process.env.VERIFY_URL_REDIRECT_SUCCESS
      : process.env.PROD_VERIFY_URL_REDIRECT_SUCCESS,
    verifyEmailExpired: isDevelopment
      ? process.env.VERIFY_URL_REDIRECT_ERROR_EXPIRED
      : process.env.PROD_VERIFY_URL_REDIRECT_ERROR_EXPIRED,
    verifyEmailInvalid: isDevelopment
      ? process.env.VERIFY_URL_REDIRECT_ERROR_INVALID
      : process.env.PROD_VERIFY_URL_REDIRECT_ERROR_INVALID,
    verifyEmailAlreadyActive: isDevelopment
      ? process.env.VERIFY_URL_REDIRECT_ERROR_ALREADY_ACT
      : process.env.PROD_VERIFY_URL_REDIRECT_ERROR_ALREADY_ACT,
    verifyServer: isDevelopment
      ? process.env.VERIFY_URL
      : process.env.PROD_VERIFY_URL,
    requestResetPasswordForm: isDevelopment
      ? process.env.RESET_PASSWORD_FORM_URL
      : process.env.PROD_RESET_PASSWORD_FORM_URL,
  },
};

export default AppConfig;
