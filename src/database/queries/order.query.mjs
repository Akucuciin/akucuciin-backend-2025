import db from "../connection.mjs";

const OrderQuery = {
  getOrderById: async function (order_id) {
    const [results] = await db.query(`SELECT * FROM orders WHERE id = ?`, [
      order_id,
    ]);
    return results[0];
  },
  getOrdersJoined: async function () {
    const [results] = await db.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.content ,
        o.status,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.coupon_code ,
        o.note,
        o.pickup_date,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
      `
    );
    return results;
  },
  getOrdersJoinedByCustomer: async function (customer_id) {
    const [results] = await db.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.content ,
        o.status,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.coupon_code ,
        o.note,
        o.pickup_date,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        WHERE o.customer_id = ?
      `,
      [customer_id]
    );
    return results;
  },
  getOrderJoinedById: async function (orderId) {
    const [results] = await db.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.content ,
        o.status,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.coupon_code ,
        o.note,
        o.pickup_date,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        WHERE o.id = ?
      `,
      [orderId]
    );
    return results;
  },
  create: async function (
    id,
    customer_id,
    laundry_partner_id,
    package_id,
    content,
    status,
    maps_pinpoint,
    weight,
    price,
    coupon_code,
    note,
    pickup_date
  ) {
    const [results] = await db.query(
      `
        INSERT INTO orders
        (id, customer_id, laundry_partner_id, package_id, content, status, maps_pinpoint, weight, price, coupon_code, note, pickup_date)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
    `,
      [
        id,
        customer_id,
        laundry_partner_id,
        package_id,
        content,
        status,
        maps_pinpoint,
        weight,
        price,
        coupon_code,
        note,
        pickup_date,
      ]
    );
  },
  isCouponExist: async function (coupon) {
    const [results] = await db.query(
      `SELECT * FROM coupons WHERE name = ?`,
      [coupon]
    );
    return results[0];
  },
  updateStatus: async function (order_id, status, weight, price) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET status = ?, weight = ?, price = ?
      WHERE id = ?
      `,
      [status, weight, price, order_id]
    );
    return results;
  },
};

export default OrderQuery;
