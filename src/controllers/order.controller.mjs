import OrderService from '../services/order.service.mjs';

const OrderController = {
  create: async (req, res, next) => {
    try {
      const result = await OrderService.create(req);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default OrderController;
