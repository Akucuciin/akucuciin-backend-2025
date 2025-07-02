import db from '../connection.mjs';

const LaundryPartnerAppQuery = {
  //Profile Read
  getProfile: async function (email) {
    const [results] = await db.query(
      `SELECT id, name, email, description, telephone, address, maps_pinpoint, city, area, latitude, longitude, created_at, updated_at FROM laundry_partners WHERE email = ?`,
      [email]
    );
    return results[0];
  },
  //Read Order by Laundry Partner Id, Edit Status Order, Read Order by Order Id
  getOrderById: async function (orderId, conn = db) {
    const [results] = await conn.query(
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
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.id = ?
      `,
      [orderId]
    );
    return results[0];
  },
  getOrdersByLaundryPartnerId: async function (laundry_partner_id) {
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
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.laundry_partner_id = ?
      `,
      [laundry_partner_id]
    );
    return results;
  },
  updateStatusOrder: async function (order_id, status, weight, conn = db) {
    const [results] = await conn.query(
      `
      UPDATE orders
      SET status = ?, weight = ?
      WHERE id = ?
      `,
      [status, weight, order_id]
    );
    return results;
  },
  updatePriceOrder: async function (order_id, price, conn = db) {
    const [results] = await conn.query(
      `
      UPDATE orders
      SET price = ?
      WHERE id = ?
      `,
      [price, order_id]
    );
    return results;
  },
  updatePriceAfterOrder: async function (order_id, price_after, conn = db) {
    const [results] = await conn.query(
      `
      UPDATE orders
      SET price_after = ?
      WHERE id = ?
      `,
      [price_after, order_id]
    );
    return results;
  },
};

export default LaundryPartnerAppQuery;
