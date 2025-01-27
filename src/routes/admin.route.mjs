import { Router } from "express";
import AdminController from "../controllers/admin.controller.mjs";
import authorize from "../middlewares/auth.middleware.mjs";

const AdminRouter = Router();

AdminRouter.post("/api/admin/login", async (req, res, next) =>
  AdminController.login(req, res, next)
);

// CUSTOMER
AdminRouter.get(
  "/api/admin/customers",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getCustomers(req, res, next)
);

export default AdminRouter;
