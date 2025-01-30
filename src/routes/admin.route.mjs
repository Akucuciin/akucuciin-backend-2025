import { Router } from "express";
import AdminController from "../controllers/admin.controller.mjs";
import authorize from "../middlewares/auth.middleware.mjs";

const AdminRouter = Router();

AdminRouter.post("/api/admin/login", async (req, res, next) =>
  AdminController.login(req, res, next)
);
AdminRouter.post("/api/admin/logout", async (req, res, next) =>
  AdminController.logout(req, res, next)
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
  async (req, res, next) =>
    AdminController.registerLaundryPartner(req, res, next)
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

// laundry partners packages  CRUD
AdminRouter.post(
  "/api/admin/laundry_partner/:id/package",
  authorize("admin-jwt"),
  async (req, res, next) =>
    AdminController.addLaundryPartnerPackage(req, res, next)
);
AdminRouter.get(
  "/api/admin/laundry_partner/:id/package/:package_id",
  authorize("admin-jwt"),
  async (req, res, next) =>
    AdminController.getLaundryPartnerPackage(req, res, next)
);
AdminRouter.put(
  "/api/admin/laundry_partner/:id/package/:package_id",
  authorize("admin-jwt"),
  async (req, res, next) =>
    AdminController.updateLaundryPartnerPackage(req, res, next)
);
AdminRouter.delete(
  "/api/admin/laundry_partner/:id/package/:package_id",
  authorize("admin-jwt"),
  async (req, res, next) =>
    AdminController.deleteLaundryPartnerPackage(req, res, next)
);

// ORDER
AdminRouter.get(
  "/api/admin/orders",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getOrdersJoined(req, res, next)
);

export default AdminRouter;
