import AuthService from "../services/auth.service.mjs";
import LaundryPartnerService from "../services/laundryPartner.service.mjs";

const LaundryPartnerController = {
  login: async (req, res, next) => {
    try {
      const result = await AuthService.LoginLaundryPartner(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      const result = await AuthService.logout(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getPartnerByIdWithPackages: async (req, res, next) => {
    try {
      const result = await LaundryPartnerService.getPartnerByIdWithPackages(
        req
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getPartnerImages: async (req, res, next) => {
    try {
      const result = await LaundryPartnerService.getPartnerImages(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getPartnersLocations: async (req, res, next) => {
    try {
      const result = await LaundryPartnerService.getPartnersLocations(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getPartnersByCity: async (req, res, next) => {
    try {
      const result = await LaundryPartnerService.getPartnersByCity(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default LaundryPartnerController;
