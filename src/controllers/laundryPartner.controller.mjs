import LaundryPartnerService from "../services/laundryPartner.service.mjs";

const LaundryPartnerController = {
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
};

export default LaundryPartnerController;
