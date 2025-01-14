import pkg from "jsonwebtoken";
import AppConfig from "../configs/app.config.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import {
  AuthenticationError,
  TokenInvalidError,
} from "../errors/customErrors.mjs";
import AuthService from "../services/auth.service.mjs";
import CustomerService from "../services/customer.service.mjs";

const { TokenExpiredError } = pkg;

const CustomerController = {
  getProfile: async (req, res, next) => {
    try {
      const result = await CustomerService.getProfile(req);
      return res.status(200).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
  register: async (req, res, next) => {
    try {
      const result = await CustomerService.register(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await AuthService.loginCustomer(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  },
  logout: async (req, res, next) => {
    try {
      const result = await AuthService.logout(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  },
  verify: async (req, res, next) => {
    try {
      const result = await CustomerService.verify(req);
      res.redirect(AppConfig.URL.verifyEmailSuccess);
    } catch (e) {
      console.log(e.message);
      if (e instanceof TokenExpiredError) {
        try {
          const { email } = req.params;
          const isActive = await CustomerQuery.isCustomerActive(email);
          if (isActive) {
            return res.redirect(AppConfig.URL.verifyEmailAlreadyActive);
          } else {
            await CustomerQuery.deleteCustomerByEmail(email);
          }
        } catch (e) {}
      } else if (e instanceof TokenInvalidError) {
        return res.redirect(AppConfig.URL.verifyEmailInvalid);
      } else if (e instanceof AuthenticationError) {
        return res.redirect(AppConfig.URL.verifyEmailAlreadyActive);
      }
      return res.redirect(AppConfig.URL.verifyEmailExpired);
    }
  },
  requestResetPassword: async (req, res, next) => {
    try {
      const result = await CustomerService.requestResetPassword(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const result = await CustomerService.changePassword(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  },
};

export default CustomerController;
