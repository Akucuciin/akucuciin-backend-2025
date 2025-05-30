import db from "../connection.mjs";

const CouponQuery = {
  get: async function (coupon_code_name, conn = db) {
    const [results] = await conn.query(`SELECT * FROM coupons WHERE name = ?`, [
      coupon_code_name,
    ]);
    return results[0];
  },
  setUsed: async function (coupon_code_name) {
    const [results] = await db.query(
      `
        UPDATE coupons
        SET is_used = 1
        WHERE name = ?
        `,
      [coupon_code_name]
    );
    return results;
  },
  setNotUsed: async function (coupon_code_name, conn = db) {
    const [results] = await conn.query(
      `
        UPDATE coupons
        SET is_used = 0
        WHERE name = ?
        `,
      [coupon_code_name]
    );
    return results;
  },
};

export default CouponQuery;
