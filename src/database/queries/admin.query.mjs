import db from "../connection.mjs";

const AdminQuery = {
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
  isValidAdmin: async function (id) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM admins WHERE id = ?`,
      [id]
    );
    return results[0].isExist;
  },
};
export default AdminQuery;
