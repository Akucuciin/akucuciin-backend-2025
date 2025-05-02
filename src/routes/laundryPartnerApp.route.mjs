import { Router } from "express";
import LaundryPartnerAppController from "../controllers/laundryPartnerApp.controller.mjs";
import authorize from "../middlewares/auth.middleware.mjs";

const LaundryPartnerAppRouter = Router();

LaundryPartnerAppRouter.get(
    "/api/laundry_partner/app/profile",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.getProfile(req, res, next);
    }
)

LaundryPartnerAppRouter.put(
    "/api/laundry_partner/app/profile",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.updateProfile(req, res, next);
    }
)

LaundryPartnerAppRouter.get(
    "/api/laundry_partner/app/order/:id",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.getOrderById(req, res, next)
    }
)

LaundryPartnerAppRouter.get(
    "/api/laundry_partner/app/orders/:id",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.getOrdersByLaundryPartnerId(req, res, next)
    }
)

LaundryPartnerAppRouter.put(
    "/api/laundry_partner/app/order/:id",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.updateStatusOrder(req, res, next);
    }
)



export default LaundryPartnerAppRouter;
