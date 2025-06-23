import CustomerQuery from "../database/queries/customer.query.mjs";
import LaundryPartnerQuery from "../database/queries/laundryPartner.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import {
  AuthorizationError,
  BadRequestError,
} from "../errors/customErrors.mjs";
import { withTransaction } from "../utils/db.utils.mjs";
import { formatOrdersFromDb } from "../utils/order.utils.mjs";
import { generateNanoidWithPrefix } from "../utils/utils.mjs";
import OrderSchema from "../validators/order.schema.mjs";
import validate from "../validators/validator.mjs";
import CouponStaticService from "./coupon.static-service.mjs";
import {
  sendOrderConfirmationToCustomer,
  sendOrderConfirmationToLaundry,
} from "./whatsapp.service.mjs";

const OrderService = {
  create: async (req) => {
    return await withTransaction(async (trx) => {
      const customer = await CustomerQuery.getCustomerProfileByEmail(
        req.user.email,
        trx
      );
      if (!customer.address?.trim()) {
        throw new AuthorizationError(
          "Gagal, silahkan isi data alamat terlebih dahulu pada profile anda"
        );
      }

      if (!customer.telephone?.trim()) {
        throw new AuthorizationError(
          "Gagal, silahkan isi data nomor telephone (Whatsapp) terlebih dahulu pada profile anda"
        );
      }

      const order = validate(OrderSchema.create, req.body);

      order.id = generateNanoidWithPrefix("ORDER");
      order.customer_id = req.user.id;

      // REFERRAL CODE APPLIED
      if (order.referral_code) {
        if (order.referral_code === customer.referral_code)
          throw new BadRequestError(
            "Gagal, gunakan kode referral selain punya anda"
          );

        const referral_code = await CustomerQuery.isReferralCodeExist(
          order.referral_code,
          trx
        );
        if (!referral_code)
          throw new BadRequestError("Gagal, Kode referral tidak ditemukan");
      }

      // COUPON APPLIED
      if (order.coupon_code) {
        await CouponStaticService.validateCouponCodeForOrder(
          order,
          req.user.id,
          trx
        );
      }

      const laundry = await LaundryPartnerQuery.getById(
        order.laundry_partner_id,
        trx
      );
      if (!laundry || !laundry.is_active)
        throw new BadRequestError("Gagal, laundry tidak ditemukan");
      const laundryPackages = await LaundryPartnerQuery.getPackageOfPartnerById(
        order.laundry_partner_id,
        order.package_id,
        trx
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
        order.referral_code,
        trx
      );

      const orderFromDb = await OrderQuery.getOrderJoinedById(order.id, trx);

      const ord = formatOrdersFromDb(orderFromDb)[0];

      ord.created_at_tz = new Date(ord.created_at).toLocaleString("id-ID", {
        timeZone: "Asia/Bangkok",
      });

      try {
        // Send To Whatsapp - Customer
        await sendOrderConfirmationToCustomer(ord);

        // Send To Whatsapp - Laundry
        await sendOrderConfirmationToLaundry(ord);
      } catch (err) {
        throw new BadRequestError(
          "Gagal, tidak bisa mengirim notifikasi Whatsapp, silahkan coba lagi"
        );
      }

      return ord;
    });
  },
};

export default OrderService;
