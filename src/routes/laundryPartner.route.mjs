import { Router } from "express";
import LaundryPartnerController from "../controllers/laundryPartner.controller.mjs";

const LaundryPartnerRouter = Router();

LaundryPartnerRouter.get("/api/laundry_partner/:id", async (req, res, next) =>
  LaundryPartnerController.getPartnerByIdWithPackages(req, res, next)
);
LaundryPartnerRouter.get("/api/laundry_partner/:id/images", async (req, res, next) =>
  LaundryPartnerController.getPartnerImages(req, res, next)
);

LaundryPartnerRouter.get(
  "/api/laundry_partners/locations",
  async (req, res, next) => {
    LaundryPartnerController.getPartnersLocations(req, res, next);
  }
);
LaundryPartnerRouter.get(
  "/api/laundry_partners/locations/:city",
  async (req, res, next) =>
    LaundryPartnerController.getPartnersByCity(req, res, next)
);

export default LaundryPartnerRouter;
