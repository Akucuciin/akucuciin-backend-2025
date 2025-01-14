import cors from "cors";
import "dotenv/config";
import express from "express";
import passport from "passport";

import AppConfig from "./configs/app.config.mjs";
import errorHandler from "./middlewares/error.middleware.mjs";
import AuthRouter from "./routes/auth.route.mjs";
import CustomerRouter from "./routes/customer.route.mjs";

import "./auth/passport.auth.mjs";

const app = express();
app.disable("x-powered-by");

const corsOptions = {
  origin: AppConfig.Server.dev ? "*" : AppConfig.Server.corsBase,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

app.use(CustomerRouter);
app.use(AuthRouter);

app.use(errorHandler);

export default app;
