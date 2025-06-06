import CouponQuery from "../database/queries/coupon.query.mjs";
import CustomerQuery from "../database/queries/customer.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import {
  AuthorizationError,
  BadRequestError,
} from "../errors/customErrors.mjs";
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
    const customer = await CustomerQuery.getCustomerProfileByEmail(
      req.user.email
    );
    if (!customer.address?.trim()) {
      console.log(customer.address);
      throw new AuthorizationError(
        "Gagal, silahkan isi data alamat terlebih dahulu pada profile anda"
      );
    }

    if (!customer.telephone?.trim()) {
      throw new AuthorizationError(
        "Gagal, silahkan isi data nomor telephone (wa) terlebih dahulu pada profile anda"
      );
    }

    const order = validate(OrderSchema.create, req.body);

    order.id = generateNanoidWithPrefix("ORDER");
    order.customer_id = req.user.id;

    // REFERRAL CODE APPLIED
    if (order.referral_code) {
      const referral_code = await CustomerQuery.isReferralCodeExist(
        order.referral_code
      );
      if (!referral_code)
        throw new BadRequestError("Gagal, Kode referral tidak ditemukan");

      const customer = await CustomerQuery.getCustomerProfileByEmail(
        req.user.email
      );
      if (order.referral_code === customer.referral_code)
        throw new BadRequestError(
          "Gagal, gunakan kode referral selain punya anda"
        );
    }

    // COUPON APPLIED
    if (order.coupon_code) {
      const coupon = await CouponQuery.get(order.coupon_code);
      if (!coupon) throw new BadRequestError("Kupon tidak ditemukan");
      if (!coupon.is_active) {
        throw new BadRequestError(
          `Gagal, Kupon ${order.coupon_code} sudah tidak aktif`
        );
      }

      if (coupon.expired_at) {
        const isCouponNotExpired = new Date(coupon.expired_at) > new Date();

        if (!isCouponNotExpired) {
          throw new BadRequestError(
            `Gagal, Kupon ${order.coupon_code} sudah kadaluarsa dan tidak bisa digunakan`
          );
        }
      }

      if (coupon.customer_id) {
        // then its only valid for THAT customer only
        if (coupon.customer_id !== req.user.id) {
          throw new BadRequestError(
            `Gagal, Kupon ini tidak valid untuk akun Anda.`
          );
        }
      }

      const allowedPackages = await CouponQuery.getPackages(order.coupon_code);
      if (allowedPackages.length > 0) {
        const allowedIds = allowedPackages.map((p) => p.package_id);
        if (!allowedIds.includes(order.package_id)) {
          throw new BadRequestError(
            `Gagal, Kupon ini hanya berlaku untuk paket tertentu dan tidak berlaku untuk paket yang Anda pilih.`
          );
        }
      }

      if (coupon.is_used === 1) {
        throw new BadRequestError(
          `Gagal, Kupon ${order.coupon_code} (sekali pakai), sudah digunakan`
        );
      } else if (coupon.is_used === -1) {
        // Coupon is infinitely used
      } else if (coupon.is_used === 0) {
        await CouponQuery.setUsed(order.coupon_code);
      }
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
