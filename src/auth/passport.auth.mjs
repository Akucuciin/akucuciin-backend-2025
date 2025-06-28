import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import AppConfig from "../configs/app.config.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
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
          role: "customer"
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
          role: "customer",
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
    const isValidCustomer = user.role === "customer";
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
    const isValidAdmin = user.role === "admin";
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
    const isValidDriver = user.role === "driver";
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
    const isValidPartner = user.role === "laundry-partner";
    if (isValidPartner) return done(null, user);
    else return done(null, false);
  })
);

export default passport;
