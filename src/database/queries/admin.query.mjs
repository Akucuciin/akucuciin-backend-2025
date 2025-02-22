import db from "../connection.mjs";

const AdminQuery = {
  addLaundryPartnerPackage: async function (
    id,
    laundry_partner_id,
    name,
    description,
    features,
    price_text
  ) {
    const [results] = await db.query(
      `
      INSERT INTO laundry_partners_packages(id, laundry_partner_id, name, description, features, price_text)
      VALUES(?, ?, ?, ?, ?, ?)
    `,
      [id, laundry_partner_id, name, description, features, price_text]
    );
    return results;
  },
  deleteLaundryPartnerPackage: async function (laundry_partner_id, package_id) {
    const [results] = await db.query(
      `DELETE FROM laundry_partners_packages WHERE id = ? AND laundry_partner_id = ?`,
      [package_id, laundry_partner_id]
    );
    return results;
  },
  getAdminForAuth: async function (email) {
    const [results] = await db.query(`SELECT * FROM admins WHERE email = ?`, [
      email,
    ]);
    return results[0];
  },
  getCustomers: async function () {
    const [results] = await db.query(
      `
      SELECT 
        c.id,
        c.email,
        c.name,
        c.address,
        c.telephone,
        c.referral_code,
        c.created_at,
        c.updated_at,
        COALESCE(rc.referral_count, 0) AS referral_code_used
        FROM customers c
        LEFT JOIN (
            SELECT 
                cz.referral_code, 
                COUNT(o.id) AS referral_count
            FROM customers cz
            LEFT JOIN orders o ON cz.referral_code = o.referral_code
            WHERE o.status != "batal"
            GROUP BY cz.referral_code
        ) rc ON c.referral_code = rc.referral_code
    `
    );
    return results;
  },
  getLaundryPartners: async function () {
    const [results] = await db.query(
      `
      SELECT 
        id, 
        name, 
        email, 
        description,
        telephone, 
        address, 
        maps_pinpoint,
        city,
        area,
        latitude, 
        longitude,
        created_at,
        updated_at
      FROM laundry_partners
      WHERE is_active = 1
    `
    );
    return results;
  },
  isValidAdmin: async function (id) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM admins WHERE id = ?`,
      [id]
    );
    return results[0].isExist;
  },
};
export default AdminQuery;
