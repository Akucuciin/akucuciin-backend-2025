import cors from "cors";
import "dotenv/config";
import express from "express";
import passport from "passport";

import AppConfig from "./configs/app.config.mjs";
import errorHandler from "./middlewares/error.middleware.mjs";
import AuthRouter from "./routes/auth.route.mjs";
import CustomerRouter from "./routes/customer.route.mjs";

import "./auth/passport.auth.mjs";
import AdminRouter from "./routes/admin.route.mjs";
import DriverRouter from "./routes/driver.route.mjs";
import LaundryPartnerRouter from "./routes/laundryPartner.route.mjs";
import LaundryPartnerAppRouter from "./routes/laundryPartnerApp.route.mjs";
import OrderRouter from "./routes/order.route.mjs";
import WebhookRouter from "./routes/webhook.route.mjs";

const app = express();
app.set("view engine", "ejs");
app.disable("x-powered-by");

const corsOptions = {
  origin: AppConfig.Server.dev ? "*" : AppConfig.Server.corsBase,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

app.use("/static", express.static("storage"));
app.use(AdminRouter);
app.use(DriverRouter);
app.use(CustomerRouter);
app.use(AuthRouter);
app.use(LaundryPartnerRouter);
app.use(LaundryPartnerAppRouter);
app.use(OrderRouter);
app.use(WebhookRouter);

app.use(errorHandler);

export default app;
