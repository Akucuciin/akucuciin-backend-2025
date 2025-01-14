import { Router } from "express";
import CustomerController from "../controllers/customer.controller.mjs";
import authenticateHandler from "../middlewares/auth.middleware.mjs";

const CustomerRouter = Router();

CustomerRouter.get(
  "/api/customer",
  authenticateHandler("customer-jwt"),
  async (req, res, next) => CustomerController.getProfile(req, res, next)
);

CustomerRouter.post("/api/customer", async (req, res, next) =>
  CustomerController.register(req, res, next)
);
CustomerRouter.post("/api/customer/login", async (req, res, next) =>
  CustomerController.login(req, res, next)
);
CustomerRouter.post("/api/customer/logout", async (req, res, next) =>
  CustomerController.logout(req, res, next)
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
CustomerRouter.put(
  "/request-reset-password/customer/:email/:reset_password_token",
  async (req, res, next) => CustomerController.changePassword(req, res, next)
);

export default CustomerRouter;
