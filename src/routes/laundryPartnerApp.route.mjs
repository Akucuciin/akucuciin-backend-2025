import { Router } from "express";
import LaundryPartnerAppController from "../controllers/laundryPartnerApp.mjs";
import { authorize } from "passport";

const LaundryPartnerAppRouter = Router();

LaundryPartnerAppRouter.get(
    "/api/laundry_partner/app/profile",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.getProfile(req ,res, next);
    }
)

LaundryPartnerAppRouter.put(
    "/api/laundry_partner/app/profile",
    authorize("laundry-partner-jwt"),
    async (req, res, next) => {
        LaundryPartnerAppController.updateProfile(req ,res, next);
    }
)

export default LaundryPartnerAppRouter;
