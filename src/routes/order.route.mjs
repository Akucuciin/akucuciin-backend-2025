import { Router } from "express";
import OrderController from "../controllers/order.controller.mjs";
import authorize from "../middlewares/auth.middleware.mjs";

const OrderRouter = Router();

OrderRouter.post(
  "/api/order",
  authorize("customer-jwt"),
  async (req, res, next) => OrderController.create(req, res, next)
);

export default OrderRouter;
