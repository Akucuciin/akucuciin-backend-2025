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
        id,
        email,
        name,
        address,
        telephone,
        isActive,
        created_at,
        updated_at
      FROM customers
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
