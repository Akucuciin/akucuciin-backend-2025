import db from "../connection.mjs";

const CouponQuery = {
  create: async function (
    name,
    multiplier,
    description,
    isUsed = 0,
    isActive = 1,
    expired_at,
    min_weight = 0,
    max_discount
  ) {
    const [results] = await db.query(
      `
        INSERT INTO coupons(name, multiplier, description, is_used, is_active, expired_at, min_weight, max_discount)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        multiplier,
        description,
        isUsed,
        isActive,
        expired_at,
        min_weight,
        max_discount,
      ]
    );
    return results;
  },
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
