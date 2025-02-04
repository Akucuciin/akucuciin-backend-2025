import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import AppConfig from "../configs/app.config.mjs";
import AdminQuery from "../database/queries/admin.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import DriverQuery from "../database/queries/driver.query.mjs";

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: AppConfig.JWT.accessTokenSecret,
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  "customer-jwt",
  new JwtStrategy(opts, async function (jwtPayload, done) {
    var expDate = new Date(jwtPayload.exp * 1000);
    if (expDate < new Date()) {
      return done(null, false);
    }
    var user = jwtPayload;
    const isValidCustomer = await CustomerQuery.isValidCustomer(user.id);
    if (isValidCustomer) return done(null, user);
    else return done(null, false);
  })
);

passport.use(
  "admin-jwt",
  new JwtStrategy(opts, async function (jwtPayload, done) {
    var expDate = new Date(jwtPayload.exp * 1000);
    if (expDate < new Date()) {
      return done(null, false);
    }
    var user = jwtPayload;
    const isValidAdmin = await AdminQuery.isValidAdmin(user.id);
    if (isValidAdmin) return done(null, user);
    else return done(null, false);
  })
);

passport.use(
  "driver-jwt",
  new JwtStrategy(opts, async function (jwtPayload, done) {
    var expDate = new Date(jwtPayload.exp * 1000);
    if (expDate < new Date()) {
      return done(null, false);
    }
    var user = jwtPayload;
    const isValidDriver = await DriverQuery.isValidDriver(user.id);
    if (isValidDriver) return done(null, user);
    else return done(null, false);
  })
);
