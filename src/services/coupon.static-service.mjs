import CouponQuery from '../database/queries/coupon.query.mjs';
import { BadRequestError } from '../errors/customErrors.mjs';

const CouponStaticService = {
  validateCouponCodeForOrder: async (order, userId, trx) => {
    const { coupon_code, package_id } = order;

    if (!coupon_code) return null;

    const coupon = await CouponQuery.get(coupon_code, trx);
    if (!coupon) {
      throw new BadRequestError('Kupon tidak ditemukan');
    }

    if (!coupon.is_active) {
      throw new BadRequestError(
        `Gagal, Kupon ${coupon_code} sudah tidak aktif`
      );
    }

    if (coupon.expired_at) {
      const isCouponNotExpired = new Date(coupon.expired_at) > new Date();
      if (!isCouponNotExpired) {
        throw new BadRequestError(
          `Gagal, Kupon ${coupon_code} sudah kadaluarsa dan tidak bisa digunakan`
        );
      }
    }

    if (coupon.customer_id && coupon.customer_id !== userId) {
      throw new BadRequestError(
        `Gagal, Kupon ini tidak valid untuk akun Anda.`
      );
    }

    const allowedPackages = await CouponQuery.getPackages(coupon_code, trx);
    if (allowedPackages.length > 0) {
      const allowedIds = allowedPackages.map((p) => p.package_id);
      if (!allowedIds.includes(package_id)) {
        throw new BadRequestError(
          `Gagal, Kupon ini hanya berlaku untuk paket tertentu dan tidak berlaku untuk paket yang Anda pilih.`
        );
      }
    }

    if (coupon.is_used === 1) {
      throw new BadRequestError(
        `Gagal, Kupon ${coupon_code} (sekali pakai), sudah digunakan`
      );
    } else if (coupon.is_used === -1) {
      // Coupon is infinitely used
    } else if (coupon.is_used === 0) {
      await CouponQuery.setUsed(coupon_code, trx);
    }

    return coupon;
  },
  validateCoupon: async (couponCode, userId) => {
    const coupon = await CouponQuery.get(couponCode);
    if (!coupon) throw new BadRequestError('Kupon tidak ditemukan');
    if (!coupon.is_active) {
      throw new BadRequestError(`Kupon ${couponCode} sudah tidak aktif`);
    }

    if (coupon.expired_at && new Date(coupon.expired_at) <= new Date()) {
      throw new BadRequestError(
        `Kupon ${couponCode} sudah kadaluarsa dan tidak bisa digunakan`
      );
    }

    if (coupon.customer_id) {
      // then its only valid for THAT customer only
      if (coupon.customer_id !== userId) {
        throw new BadRequestError(`Kupon ini tidak valid untuk akun Anda.`);
      }
    }

    if (coupon.is_used === 1) {
      throw new BadRequestError(
        `Kupon ${couponCode} (sekali pakai), sudah digunakan`
      );
    } else if (coupon.is_used === -1) {
      // Coupon is infinitely used
    }

    return coupon;
  },
};

export default CouponStaticService;
