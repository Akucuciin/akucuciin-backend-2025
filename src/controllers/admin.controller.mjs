import AdminService from "../services/admin.service.mjs";
import AuthService from "../services/auth.service.mjs";

const AdminController = {
  login: async (req, res, next) => {
    try {
      const result = await AuthService.loginAdmin(req);
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
  getCustomers: async (req, res, next) => {
    try {
      const result = await AdminService.getCustomers(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getLaundryPartners: async (req, res, next) => {
    try {
      const result = await AdminService.getLaundryPartners(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  registerLaundryPartner: async (req, res, next) => {
    try {
      const result = await AdminService.registerLaundryPartner(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteLaundryPartner: async (req, res, next) => {
    try {
      const result = await AdminService.deleteLaundryPartner(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  updateLaundryPartner: async (req, res, next) => {
    try {
      const result = await AdminService.updateLaundryPartner(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  addLaundryPartnerPackage: async (req, res, next) => {
    try {
      const result = await AdminService.addLaundryPartnerPackage(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getLaundryPartnerPackage: async (req, res, next) => {
    try {
      const result = await AdminService.getLaundryPartnerPackage(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteLaundryPartnerPackage: async (req, res, next) => {
    try {
      const result = await AdminService.deleteLaundryPartnerPackage(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  updateLaundryPartnerPackage: async (req, res, next) => {
    try {
      const result = await AdminService.updateLaundryPartnerPackage(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  addLaundryPartnerImage: async (req, res, next) => {
    try {
      const result = await AdminService.addLaundryPartnerImage(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteLaundryPartnerImage: async (req, res, next) => {
    try {
      const result = await AdminService.deleteLaundryPartnerImage(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getOrdersJoined: async (req, res, next) => {
    try {
      const result = await AdminService.getOrdersJoined(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default AdminController;
