import { Router } from "express";
import useRateLimiter from "../configs/rateLimiter.config.mjs";
import CustomerController from "../controllers/customer.controller.mjs";
import authorize from "../middlewares/auth.middleware.mjs";

const CustomerRouter = Router();

CustomerRouter.get(
  "/api/customer",
  authorize("customer-jwt"),
  async (req, res, next) => CustomerController.getProfile(req, res, next)
);
CustomerRouter.put(
  "/api/customer",
  authorize("customer-jwt"),
  async (req, res, next) => CustomerController.updateProfile(req, res, next)
);

CustomerRouter.post(
  "/api/customer/referral_code",
  authorize("customer-jwt"),
  async (req, res, next) =>
    CustomerController.createReferralCode(req, res, next)
);

CustomerRouter.post("/api/customer", async (req, res, next) =>
  CustomerController.register(req, res, next)
);
CustomerRouter.post(
  "/api/customer/login",
  useRateLimiter(5, 2),
  async (req, res, next) => CustomerController.login(req, res, next)
);
CustomerRouter.post("/api/customer/logout", async (req, res, next) =>
  CustomerController.logout(req, res, next)
);

CustomerRouter.get(
  "/api/customer/orders",
  authorize("customer-jwt"),
  async (req, res, next) => CustomerController.getOrders(req, res, next)
);
CustomerRouter.post(
  "/api/customer/order/:order_id/review",
  authorize("customer-jwt"),
  async (req, res, next) =>
    CustomerController.giveRatingAndReview(req, res, next)
);
CustomerRouter.delete(
  "/api/customer/order/:order_id",
  authorize("customer-jwt"),
  async (req, res, next) => CustomerController.cancelOrder(req, res, next)
);

CustomerRouter.get(
  "/verify/customer/:email/:register_token",
  async (req, res, next) => {
    CustomerController.verify(req, res, next);
  }
);

CustomerRouter.post("/request-reset-password", async (req, res, next) =>
  CustomerController.requestResetPassword(req, res, next)
);
CustomerRouter.post("/resend-verification-email", async (req, res, next) =>
  CustomerController.resendVerificationEmail(req, res, next)
);
CustomerRouter.put(
  "/request-reset-password/customer/:email/:reset_password_token",
  async (req, res, next) => CustomerController.changePassword(req, res, next)
);

export default CustomerRouter;
