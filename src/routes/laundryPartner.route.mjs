import { Router } from "express";
import LaundryPartnerController from "../controllers/laundryPartner.controller.mjs";

const LaundryPartnerRouter = Router();

LaundryPartnerRouter.get(
  "/api/laundry_partners/locations",
  async (req, res, next) => {
    LaundryPartnerController.getPartnersLocations(req, res, next);
  }
);

export default LaundryPartnerRouter;
