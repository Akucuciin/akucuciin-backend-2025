import OrderQuery from "../database/queries/order.query.mjs";
import { generateUuidWithPrefix } from "../utils/utils.mjs";
import OrderSchema from "../validators/order.schema.mjs";
import validate from "../validators/validator.mjs";
import { sendMessage } from "./whatsapp.service.mjs";

const OrderService = {
  create: async (req) => {
    const order = validate(OrderSchema.create, req.body);

    order.id = generateUuidWithPrefix("ORDER");
    order.customer_id = req.user.id;

    await OrderQuery.create(
      order.id,
      order.customer_id,
      order.laundry_partner_id,
      order.package_id,
      order.content,
      order.status,
      order.weight,
      order.price,
      order.coupon_code
    );

    const orderFromDb = await OrderQuery.getOrderJoinedById(order.id);

    const ord = orderFromDb.map((row) => ({
      id: row.id,
      content: row.content,
      status: row.status,
      weight: row.weight,
      price: row.price,
      coupon_code: row.coupon_code,
      created_at: row.created_at,
      customer: {
        id: row.c_id,
        name: row.c_name,
        email: row.c_email,
        address: row.c_address,
        telephone: row.c_telephone,
      },
      laundry_partner: {
        id: row.lp_id,
        name: row.lp_name,
        email: row.lp_email,
        address: row.lp_address,
        city: row.lp_city,
        area: row.lp_area,
        telephone: row.lp_telephone,
      },
      package: {
        id: row.p_id,
        name: row.p_name,
        price_text: row.p_price_text,
        description: row.p_description,
      },
    }))[0];

    ord.created_at_tz = new Date(ord.created_at).toLocaleString("id-ID", {
      timeZone: "Asia/Bangkok",
    });

    await sendMessage(
      `${ord.customer.telephone}@s.whatsapp.net`,
      `*Order anda telah diterima*\n\n==Customer==\nNama: ${
        ord.customer.name
      }\nEmail: ${ord.customer.email}\nAlamat: ${
        ord.customer.address
      }\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${
        ord.laundry_partner.area
      },${ord.laundry_partner.city}\nNo HP laundry: https://wa.me/${
        ord.laundry_partner.telephone
      }\n\nPaket Laundry: ${ord.package.name}\nContent: ${
        ord.content
      }\n\nKupon : ${
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
      }\nAlamat: ${ord.customer.address}\nNo HP Cust: https://wa.me/${
        ord.customer.telephone
      }\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${
        ord.laundry_partner.area
      },${ord.laundry_partner.city}\nEmail:  ${
        ord.laundry_partner.email
      }\n\nPaket Laundry: ${ord.package.name}\nContent: ${
        ord.content
      }\n\nKupon : ${
        ord.coupon_code || "-"
      }\n====================\n\n_Pesan ini dibuat otomatis oleh sistem Akucuciin_\n_${
        ord.id
      }_\n\nTanggal: ${ord.created_at_tz}
      `
    );

    return ord;
  },
};

export default OrderService;
