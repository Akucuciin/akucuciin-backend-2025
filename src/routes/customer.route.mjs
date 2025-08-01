import { Router } from 'express';
import passport from '../auth/passport.auth.mjs';
import useRateLimiter from '../configs/rateLimiter.config.mjs';
import CustomerController from '../controllers/customer.controller.mjs';
import authorize from '../middlewares/auth.middleware.mjs';
import multiAuthorize from '../middlewares/multiAuth.middleware.mjs';

const CustomerRouter = Router();

CustomerRouter.get(
  '/api/customer',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.getProfile(req, res, next)
);
CustomerRouter.put(
  '/api/customer',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.updateProfile(req, res, next)
);

CustomerRouter.post(
  '/api/customer/referral_code',
  authorize('customer-jwt'),
  useRateLimiter(
    2,
    2,
    'Too many request to create referral code, please try again in 2 minutes'
  ),
  async (req, res, next) =>
    CustomerController.createReferralCode(req, res, next)
);
CustomerRouter.get(
  '/api/customer/public/referral_code/:referral_code',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.checkReferralCode(req, res, next)
);

// === Register, Auth
CustomerRouter.post('/api/customer', async (req, res, next) =>
  CustomerController.register(req, res, next)
);
CustomerRouter.post(
  '/api/customer/login',
  useRateLimiter(5, 2),
  async (req, res, next) => CustomerController.login(req, res, next)
);
CustomerRouter.post('/api/customer/logout', async (req, res, next) =>
  CustomerController.logout(req, res, next)
);

CustomerRouter.get(
  '/api/customer/login/google-auth',
  passport.authenticate('customer-google-auth', { scope: ['profile', 'email'] })
);
// === END Register, Auth

// === ORDER
CustomerRouter.get(
  '/api/customer/last-order',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.getLastOrder(req, res, next)
);
CustomerRouter.get(
  '/api/customer/orders',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.getOrders(req, res, next)
);
CustomerRouter.get(
  '/api/customer/order/:order_id',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.getOrder(req, res, next)
);
CustomerRouter.get(
  '/api/customer/order/:order_id/pay',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.payOrder(req, res, next)
);
CustomerRouter.post(
  '/api/customer/order/:order_id/review',
  authorize('customer-jwt'),
  async (req, res, next) =>
    CustomerController.giveRatingAndReview(req, res, next)
);
CustomerRouter.delete(
  '/api/customer/order/:order_id',
  authorize('customer-jwt'),
  async (req, res, next) => CustomerController.cancelOrder(req, res, next)
);
CustomerRouter.post(
  '/api/customer/order/:order_id/reminders/payment',
  multiAuthorize('admin|laundry-partner'),
  useRateLimiter(
    1,
    5,
    'Gagal, reminder sudah dikirimkan sebelumnya, silakan coba lagi dalam 5 menit'
  ),
  async (req, res, next) =>
    CustomerController.sendPaymentReminder(req, res, next)
);
// === END ORDER

CustomerRouter.get(
  '/verify/customer/:email/:register_token',
  async (req, res, next) => {
    CustomerController.verify(req, res, next);
  }
);

CustomerRouter.post(
  '/request-reset-password',
  useRateLimiter(2, 1, 'Too many request, please try again next time'),
  async (req, res, next) =>
    CustomerController.requestResetPassword(req, res, next)
);
CustomerRouter.post(
  '/resend-verification-email',
  useRateLimiter(1, 1, 'Too many resend, please try again next time'),
  async (req, res, next) =>
    CustomerController.resendVerificationEmail(req, res, next)
);
CustomerRouter.put(
  '/request-reset-password/customer/:email/:reset_password_token',
  async (req, res, next) => CustomerController.changePassword(req, res, next)
);

export default CustomerRouter;
