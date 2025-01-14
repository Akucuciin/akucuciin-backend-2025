import passport from "passport";

const authenticateHandler = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export default authenticateHandler;
