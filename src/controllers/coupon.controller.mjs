import CouponService from '../services/coupon.service.mjs';

const CouponController = {
  getCouponByCode: async (req, res, next) => {
    try {
      const result = await CouponService.getCouponByCode(req);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default CouponController;
