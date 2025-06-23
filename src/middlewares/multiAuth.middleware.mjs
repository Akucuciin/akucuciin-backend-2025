import passport from "passport";

const multiAuthorize = (roles) => {
  const strategies = roles.split("|").map((role) => `${role}-jwt`);

  return async (req, res, next) => {
    let authenticated = false;
    let lastError = null;

    for (const strategy of strategies) {
      await new Promise((resolve) => {
        passport.authenticate(
          strategy,
          { session: false },
          (err, user, info) => {
            if (err) {
              lastError = err;
              return resolve(); // next
            }
            if (user) {
              req.user = user;
              authenticated = true;
              return resolve(); // first success
            }
            lastError = info;
            resolve(); // try next
          }
        )(req, res, resolve);
      });

      if (authenticated) return next();
    }

    const readableRoles = roles.replace(/\|/g, " or ");
    return res.status(401).json({
      success: false,
      message: `Unauthorized, only ${readableRoles}`,
      error: lastError?.message || null,
    });
  };
};

export default multiAuthorize;