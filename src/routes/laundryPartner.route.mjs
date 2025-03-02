import { Router } from "express";
import LaundryPartnerController from "../controllers/laundryPartner.controller.mjs";

const LaundryPartnerRouter = Router();

// AUTH
LaundryPartnerRouter.post(
  "/api/laundry_partner/app/login",
  async (req, res, next) => {
    LaundryPartnerController.login(req, res, next);
  }
);
LaundryPartnerRouter.post(
  "/api/laundry_partner/app/logout",
  async (req, res, next) => {
    LaundryPartnerController.logout(req, res, next);
  }
);

LaundryPartnerRouter.get("/api/laundry_partner/:id", async (req, res, next) =>
  LaundryPartnerController.getPartnerByIdWithPackages(req, res, next)
);
LaundryPartnerRouter.get(
  "/api/laundry_partner/:id/images",
  async (req, res, next) =>
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
