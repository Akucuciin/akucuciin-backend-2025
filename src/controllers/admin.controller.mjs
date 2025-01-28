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
      return res.status(201).json({
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
      return res.status(201).json({
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
};

export default AdminController;
