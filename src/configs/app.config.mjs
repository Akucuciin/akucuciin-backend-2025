const isDevelopment = Number(process.env.DEV);

const AppConfig = {
  Server: {
    dev: Number(process.env.DEV),
    port: process.env.PORT,
    corsBase: process.env.CORS_BASE,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL,
  },
  DB: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  GOOGLE: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
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
  PAYMENT: {
    DOKU: {
      clientId: process.env.DOKU_CLIENT_ID,
      expiredTime: process.env.DOKU_EXPIRED_TIME,
      secretKey: process.env.DOKU_SECRET_KEY,
      url: process.env.DOKU_URL,
      checkStatusUrl: process.env.DOKU_CHECK_STATUS_URL,
      callback_url: process.env.DOKU_CALLBACK_URL,
      signature: {
        requestTarget: process.env.DOKU_SIGNATURE_REQUEST_TARGET,
        checkStatusRequestTarget:
          process.env.DOKU_SIGNATURE_CHECK_STATUS_REQUEST_TARGET,
      },
    },
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
  Whatsapp: {
    HMAC_SECRET: process.env.HMAC_SECRET,
    SEND_URL: process.env.SEND_WA_URL,
  },
};

export default AppConfig;
