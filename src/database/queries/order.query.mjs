import db from "../connection.mjs";

const OrderQuery = {
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
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
      `
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
    coupon_code
  ) {
    const [results] = await db.query(
      `
        INSERT INTO orders
        (id, customer_id, laundry_partner_id, package_id, content, status, maps_pinpoint, weight, price, coupon_code)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    );
  },
};

export default OrderQuery;
