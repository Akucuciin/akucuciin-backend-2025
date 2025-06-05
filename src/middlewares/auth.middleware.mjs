import passport from "passport";

const authorize = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      let message = "Unauthorized";
      if (strategy == "customer-jwt") message = "Unauthorized, only customer";
      else if (strategy == "admin-jwt") message = "Unauthorized, only admin";
      else if (strategy == "driver-jwt") message = "Unauthorized, only driver";
      else if (strategy == "laundry-partner-jwt") message = "Unauthorized, only partner";
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ success: false, message: message });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export default authorize;
