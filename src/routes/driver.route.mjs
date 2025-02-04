import { Router } from "express";
import useRateLimiter from "../configs/rateLimiter.config.mjs";
import DriverController from "../controllers/driver.controller.mjs";

const DriverRouter = Router();

// Auth
DriverRouter.post(
  "/api/driver/login",
  useRateLimiter(8, 2),
  async (req, res, next) => DriverController.login(req, res, next)
);
DriverRouter.post(
    "/api/driver/logout",
    async (req, res, next) => DriverController.logout(req, res, next)
  );

export default DriverRouter;
