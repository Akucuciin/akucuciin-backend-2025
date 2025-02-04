import AuthService from "../services/auth.service.mjs";
import DriverService from "../services/driver.service.mjs";

const DriverController = {
  login: async (req, res, next) => {
    try {
      const result = await AuthService.loginDriver(req);
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
  getProfile: async (req, res, next) => {
    try {
      const result = await DriverService.getProfile(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getOrdersAssigned: async (req, res, next) => {
    try {
      const result = await DriverService.getOrdersAssigned(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default DriverController;
