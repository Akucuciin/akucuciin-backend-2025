import { Router } from "express";
import { uploadPartnerImage } from "../configs/multer.config.mjs";
import useRateLimiter from "../configs/rateLimiter.config.mjs";
import AdminController from "../controllers/admin.controller.mjs";
import authorize from "../middlewares/auth.middleware.mjs";
const AdminRouter = Router();

// Auth
AdminRouter.post(
  "/api/admin/login",
  useRateLimiter(5, 2),
  async (req, res, next) => AdminController.login(req, res, next)
);
AdminRouter.post("/api/admin/logout", async (req, res, next) =>
  AdminController.logout(req, res, next)
);
AdminRouter.get("/api/admin/status", authorize("admin-jwt"), (req, res, next) =>
  res.status(200).json({ data: "Authenticated Admin" })
);

// CUSTOMER
AdminRouter.get(
  "/api/admin/customers",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getCustomers(req, res, next)
);
AdminRouter.get(
  "/api/admin/customer/:id/orders",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getCustomerOrders(req, res, next)
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

AdminRouter.post(
  "/api/admin/laundry_partner/:id/image",
  authorize("admin-jwt"),
  uploadPartnerImage,
  async (req, res, next) =>
    AdminController.addLaundryPartnerImage(req, res, next)
);
AdminRouter.delete(
  "/api/admin/laundry_partner/:id/image/:image_id",
  authorize("admin-jwt"),
  async (req, res, next) =>
    AdminController.deleteLaundryPartnerImage(req, res, next)
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
  "/api/admin/orders/excel",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.exportOrderToExcel(req, res, next)
);

AdminRouter.get(
  "/api/admin/orders",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getOrdersJoined(req, res, next)
);

AdminRouter.put(
  "/api/admin/order/:id/status",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.updateOrderStatus(req, res, next)
);

AdminRouter.post(
  "/api/admin/order/:order_id/driver/:driver_id",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.assignOrderToDriver(req, res, next)
);

AdminRouter.delete(
  "/api/admin/order/:order_id/driver",
  authorize("admin-jwt"),
  async (req, res, next) =>
    AdminController.cancelAssignedDriverOfOrder(req, res, next)
);

// DRIVER
AdminRouter.post(
  "/api/admin/driver",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.registerDriver(req, res, next)
);

AdminRouter.put(
  "/api/admin/driver/:id",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.updateDriver(req, res, next)
);

AdminRouter.get(
  "/api/admin/drivers",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.getDrivers(req, res, next)
);

AdminRouter.delete(
  "/api/admin/driver/:id",
  authorize("admin-jwt"),
  async (req, res, next) => AdminController.deleteDriver(req, res, next)
);
export default AdminRouter;
