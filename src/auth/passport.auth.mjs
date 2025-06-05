import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import AppConfig from "../configs/app.config.mjs";
import AdminQuery from "../database/queries/admin.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import DriverQuery from "../database/queries/driver.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import { generateNanoidWithPrefix } from "../utils/utils.mjs";

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: AppConfig.JWT.accessTokenSecret,
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

// Google Auth(s)
passport.use(
  "customer-google-auth",
  new GoogleStrategy(
    {
      clientID: AppConfig.GOOGLE.clientId,
      clientSecret: AppConfig.GOOGLE.clientSecret,
      callbackURL: AppConfig.GOOGLE.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      const emailFromOAuth = profile.emails?.[0]?.value;
      const nameFromOAuth = profile.displayName;

      const isEmailExists = await CustomerQuery.isEmailExists(emailFromOAuth);

      if (isEmailExists) {
        console.error(`${new Date()} ${emailFromOAuth} ALREADY REGISTERED`);
        const customer = await CustomerQuery.getCustomerProfileByEmail(
          emailFromOAuth
        );

        if (!customer.isActive) {
          await CustomerQuery.activateCustomer(emailFromOAuth);
        }

        return done(null, {
          id: customer.id,
          email: customer.email,
        });
      } else {
        console.error(`${new Date()} ${emailFromOAuth} DIDNT YET REGISTERED`);
        // if not exists then register it
        const newCustomerId = generateNanoidWithPrefix("GOOGLE-CUST");
        await CustomerQuery.registerCustomer(
          newCustomerId,
          emailFromOAuth,
          null,
          nameFromOAuth,
          null,
          null
        );
        await CustomerQuery.activateCustomer(emailFromOAuth);

        return done(null, {
          id: newCustomerId,
          email: emailFromOAuth,
        });
      }
    }
  )
);

// Regular Auth(s)
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

passport.use(
  "laundry-partner-jwt",
  new JwtStrategy(opts, async function (jwtPayload, done) {
    var expDate = new Date(jwtPayload.exp * 1000);
    if (expDate < new Date()) {
      return done(null, false);
    }
    var user = jwtPayload;
    const isValidPartner = await LaundryPartnerQuery.isValidPartner(user.id);
    if (isValidPartner) return done(null, user);
    else return done(null, false);
  })
);

export default passport;
