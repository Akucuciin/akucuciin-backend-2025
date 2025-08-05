import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import passport from 'passport';

import AppConfig from './configs/app.config.mjs';
import errorHandler from './middlewares/error.middleware.mjs';
import AuthRouter from './routes/auth.route.mjs';
import CustomerRouter from './routes/customer.route.mjs';

import './auth/passport.auth.mjs';
import pinoMiddleware from './middlewares/logger.middleware.mjs';
import requestLogger from './middlewares/requestLogger.middleware.mjs';
import AdminRouter from './routes/admin.route.mjs';
import CouponRouter from './routes/coupon.route.mjs';
import DriverRouter from './routes/driver.route.mjs';
import LaundryPartnerRouter from './routes/laundryPartner.route.mjs';
import LaundryPartnerAppRouter from './routes/laundryPartnerApp.route.mjs';
import OrderRouter from './routes/order.route.mjs';
import VersionRouter from './routes/version.route.mjs';
import WebhookRouter from './routes/webhook.route.mjs';

const app = express();
app.use(requestLogger);

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.disable('x-powered-by');

const corsOptions = {
  origin: AppConfig.Server.dev ? '*' : AppConfig.Server.corsBase,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8'); // raw body for signature verification [DOKU]
    },
  })
);
app.use(passport.initialize());

app.use(pinoMiddleware);
app.use('/static', express.static('storage'));
app.use(AdminRouter);
app.use(DriverRouter);
app.use(CustomerRouter);
app.use(AuthRouter);
app.use(LaundryPartnerRouter);
app.use(LaundryPartnerAppRouter);
app.use(OrderRouter);
app.use(CouponRouter);
app.use(WebhookRouter);
app.use(VersionRouter);

app.use(errorHandler);

export default app;
