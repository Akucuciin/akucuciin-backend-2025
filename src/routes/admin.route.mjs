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

// Laundry Partners CRUD
AdminRouter.get(
  "/api/admin/laundry_partners",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getLaundryPartners(req, res, next)
);
AdminRouter.post(
  "/api/admin/laundry_partner",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.registerLaundryPartner(req, res, next)
);
AdminRouter.delete(
  "/api/admin/laundry_partner/:id",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.deleteLaundryPartner(req, res, next)
);
AdminRouter.put(
  "/api/admin/laundry_partner/:id",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.updateLaundryPartner(req, res, next)
);

export default AdminRouter;

