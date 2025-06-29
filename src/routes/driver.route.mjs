import { Router } from 'express';
import useRateLimiter from '../configs/rateLimiter.config.mjs';
import DriverController from '../controllers/driver.controller.mjs';
import authorize from '../middlewares/auth.middleware.mjs';

const DriverRouter = Router();

// Auth
DriverRouter.post(
  '/api/driver/login',
  useRateLimiter(8, 2),
  async (req, res, next) => DriverController.login(req, res, next)
);
DriverRouter.post('/api/driver/logout', async (req, res, next) =>
  DriverController.logout(req, res, next)
);

// Profile
DriverRouter.get(
  '/api/driver',
  authorize('driver-jwt'),
  async (req, res, next) => DriverController.getProfile(req, res, next)
);

// Order
DriverRouter.get(
  '/api/driver/orders',
  authorize('driver-jwt'),
  async (req, res, next) => DriverController.getOrdersAssigned(req, res, next)
);
DriverRouter.put(
  '/api/driver/order/:id',
  authorize('driver-jwt'),
  async (req, res, next) => DriverController.updateOrderStatus(req, res, next)
);

export default DriverRouter;
