import pkg from 'jsonwebtoken';
import AppConfig from '../configs/app.config.mjs';
import CustomerQuery from '../database/queries/customer.query.mjs';
import {
  AuthenticationError,
  TokenInvalidError,
} from '../errors/customErrors.mjs';
import AuthService from '../services/auth.service.mjs';
import CustomerService from '../services/customer.service.mjs';

const { TokenExpiredError } = pkg;

const CustomerController = {
  getProfile: async (req, res, next) => {
    try {
      const result = await CustomerService.getProfile(req);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const result = await CustomerService.updateProfile(req);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  createReferralCode: async (req, res, next) => {
    try {
      const result = await CustomerService.createReferralCode(req);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  checkReferralCode: async (req, res, next) => {
    try {
      const result = await CustomerService.checkReferralCode(req);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  register: async (req, res, next) => {
    try {
      const result = await CustomerService.register(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await AuthService.loginCustomer(req);
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
  getLastOrder: async (req, res, next) => {
    try {
      const result = await CustomerService.getLastOrder(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getOrders: async (req, res, next) => {
    try {
      const result = await CustomerService.getOrders(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  getOrder: async (req, res, next) => {
    try {
      const result = await CustomerService.getOrder(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  payOrder: async (req, res, next) => {
    try {
      const result = await CustomerService.payOrder(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  giveRatingAndReview: async (req, res, next) => {
    try {
      const result = await CustomerService.giveRatingAndReview(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  cancelOrder: async (req, res, next) => {
    try {
      const result = await CustomerService.cancelOrder(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  sendPaymentReminder: async (req, res, next) => {
    try {
      const result = await CustomerService.sendPaymentReminder(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  verify: async (req, res, next) => {
    try {
      const result = await CustomerService.verify(req);
      res.redirect(AppConfig.URL.verifyEmailSuccess);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        try {
          const { email } = req.params;
          const isActive = await CustomerQuery.isCustomerActive(email);
          if (isActive) {
            return res.redirect(AppConfig.URL.verifyEmailAlreadyActive);
          } else {
            await CustomerQuery.deleteCustomerByEmail(email);
          }
        } catch (error) {}
      } else if (error instanceof TokenInvalidError) {
        return res.redirect(AppConfig.URL.verifyEmailInvalid);
      } else if (error instanceof AuthenticationError) {
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
    } catch (error) {
      next(error);
    }
  },
  resendVerificationEmail: async (req, res, next) => {
    try {
      const result = await CustomerService.resendVerificationEmail(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const result = await CustomerService.changePassword(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default CustomerController;
