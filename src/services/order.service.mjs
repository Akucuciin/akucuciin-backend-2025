import CouponQuery from "../database/queries/coupon.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import { formatOrdersFromDb } from "../utils/order.utils.mjs";
import { generateNanoidWithPrefix } from "../utils/utils.mjs";
import OrderSchema from "../validators/order.schema.mjs";
import validate from "../validators/validator.mjs";
import {
  sendOrderConfirmationToCustomer,
  sendOrderConfirmationToLaundry,
} from "./whatsapp.service.mjs";

const OrderService = {
  create: async (req) => {
    const order = validate(OrderSchema.create, req.body);

    order.id = generateNanoidWithPrefix("ORDER");
    order.customer_id = req.user.id;

    if (order.coupon_code) {
      const coupon = await CouponQuery.get(order.coupon_code);
      if (!coupon) throw new BadRequestError("Kupon tidak ditemukan");
      if (!coupon.is_active) {
        throw new BadRequestError(
          `Gagal, Kupon ${order.coupon_code} sudah tidak aktif`
        );
      }
      if (coupon.is_used === 1) {
        throw new BadRequestError(
          `Gagal, Kupon ${order.coupon_code} (sekali pakai), sudah pernah digunakan pelanggan lain`
        );
      } else if (coupon.is_used === -1) {
        // Coupon is infinitely used
      } else if (coupon.is_used === 0) {
        await CouponQuery.setUsed(order.coupon_code);
      }
    }
    if (order.referral_code) {
      const referral_code = await CustomerQuery.isReferralCodeExist(
        order.referral_code
      );
      if (!referral_code)
        throw new BadRequestError("Kode referral tidak ditemukan");

      const customer = await CustomerQuery.getCustomerProfileByEmail(
        req.user.email
      );
      if (order.referral_code === customer.referral_code)
        throw new BadRequestError(
          "Gagal, gunakan kode referral selain punya anda"
        );
    }

    const laundry = await LaundryPartnerQuery.getById(order.laundry_partner_id);
    if (!laundry || !laundry.is_active)
      throw new BadRequestError("Gagal, laundry tidak ditemukan");
    const laundryPackages = await LaundryPartnerQuery.getPackageOfPartnerById(
      order.laundry_partner_id,
      order.package_id
    );
    if (!laundryPackages)
      throw new BadRequestError("Gagal, paket laundry tidak ditemukan");

    await OrderQuery.create(
      order.id,
      order.customer_id,
      order.laundry_partner_id,
      order.package_id,
      order.content,
      order.status,
      order.maps_pinpoint,
      order.weight,
      order.price,
      order.coupon_code,
      order.note,
      order.pickup_date,
      order.referral_code
    );

    const orderFromDb = await OrderQuery.getOrderJoinedById(order.id);

    const ord = formatOrdersFromDb(orderFromDb)[0];

    ord.created_at_tz = new Date(ord.created_at).toLocaleString("id-ID", {
      timeZone: "Asia/Bangkok",
    });

    // Send To Whatsapp - Customer
    await sendOrderConfirmationToCustomer(ord);

    // Send To Whatsapp - Laundry
    await sendOrderConfirmationToLaundry(ord);

    return ord;
  },
};

export default OrderService;
