import CouponStaticService from './coupon.static-service.mjs';

const CouponService = {
  getCouponByCode: async (req) => {
    const { code } = req.params;
    const coupon = await CouponStaticService.validateCoupon(code, req.user.id);
    return coupon;
  },
};

export default CouponService;
