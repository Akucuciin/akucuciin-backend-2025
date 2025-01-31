import { rateLimit } from "express-rate-limit";

function useRateLimiter(limit, windowMinute) {
  return rateLimit({
    windowMs: windowMinute * 60 * 1000,
    limit: limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { errors: "Too many requests, please try again later." },
    statusCode: 429,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    },
  });
}
export default useRateLimiter;
