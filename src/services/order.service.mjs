import CustomerQuery from "../database/queries/customer.query.mjs";
import OrderQuery from "../database/queries/order.query.mjs";
import { BadRequestError } from "../errors/customErrors.mjs";
import formatOrdersFromDb from "../utils/order.utils.mjs";
import { generateNanoidWithPrefix } from "../utils/utils.mjs";
import OrderSchema from "../validators/order.schema.mjs";
import validate from "../validators/validator.mjs";

const OrderService = {
  create: async (req) => {
    const order = validate(OrderSchema.create, req.body);

    order.id = generateNanoidWithPrefix("ORDER");
    order.customer_id = req.user.id;

    if (order.coupon_code) {
      const coupon = await OrderQuery.isCouponExist(order.coupon_code);
      if (!coupon) throw new BadRequestError("Kupon tidak ditemukan");
    }
    if (order.referral_code) {
      const referral_code = await CustomerQuery.isReferralCodeExist(
        order.referral_code
      );
      if (!referral_code)
        throw new BadRequestError("Kode referral tidak ditemukan");
    }

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

    /* await sendMessage(
      `${ord.customer.telephone}@s.whatsapp.net`,
      `*Order anda telah diterima*\n\n==Customer==\nNama: ${
        ord.customer.name
      }\nEmail: ${ord.customer.email}\nAlamat: ${
        ord.customer.address
      }\nPinpoint: ${ord.maps_pinpoint}\n\n==LAUNDRY==\n${
        ord.laundry_partner.name
      }, ${ord.laundry_partner.area},${
        ord.laundry_partner.city
      }\nNo HP laundry: https://wa.me/${
        ord.laundry_partner.telephone
      }\n\nPaket Laundry: ${ord.package.name}\nContent: ${ord.content}\nNote: ${
        ord.note
      }\nPickup Date: ${ord.pickup_date}\n\nKupon : ${
        ord.coupon_code || "-"
      }\n====================\n\n_Pesan ini dibuat otomatis oleh sistem Akucuciin_\n_${
        ord.id
      }_\n\nTanggal: ${ord.created_at_tz}
      `
    );

    await sendMessage(
      `${ord.laundry_partner.telephone}@s.whatsapp.net`,
      `*Order masuk*\n\n==Customer==\nNama: ${ord.customer.name}\nEmail: ${
        ord.customer.email
      }\nAlamat: ${ord.customer.address}\nPinpoint: ${
        ord.maps_pinpoint
      }\nNo HP Cust: https://wa.me/${ord.customer.telephone}\n\n==LAUNDRY==\n${
        ord.laundry_partner.name
      }, ${ord.laundry_partner.area},${ord.laundry_partner.city}\nEmail:  ${
        ord.laundry_partner.email
      }\n\nPaket Laundry: ${ord.package.name}\nContent: ${ord.content}\nNote: ${
        ord.note
      }\nPickup Date: ${ord.pickup_date}\n\nKupon : ${
        ord.coupon_code || "-"
      }\n====================\n\n_Pesan ini dibuat otomatis oleh sistem Akucuciin_\n_${
        ord.id
      }_\n\nTanggal: ${ord.created_at_tz}
      `
    ); */

    return ord;
  },
};

export default OrderService;
