import { Router } from "express";
import useRateLimiter from "../configs/rateLimiter.config.mjs";
import CouponController from "../controllers/coupon.controller.mjs";
import multiAuthorize from "../middlewares/multiAuth.middleware.mjs";

const CouponRouter = Router();

CouponRouter.get(
  "/api/coupon/:code",
  useRateLimiter(15, 2),
  multiAuthorize("customer|admin"),
  async (req, res, next) => CouponController.getCouponByCode(req, res, next)
);

export default CouponRouter;
