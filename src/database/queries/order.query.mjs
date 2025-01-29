import db from "../connection.mjs";

const OrderQuery = {
  create: async function (
    id,
    customer_id,
    laundry_partner_id,
    content,
    status,
    weight,
    price,
    coupon_code
  ) {
    const [results] = await db.query(
      `
        INSERT INTO orders
        (id, customer_id, laundry_partner_id, content, status, weight, price, coupon_code)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        customer_id,
        laundry_partner_id,
        content,
        status,
        weight,
        price,
        coupon_code,
      ]
    );
  },
};

export default OrderQuery;
