import db from "../connection.mjs";

const CustomerQuery = {
  activateCustomer: async function (email) {
    const [results] = await db.query(
      `
        UPDATE customers SET isActive = 1 WHERE email = ?
      `,
      [email]
    );
    return results;
  },
  createReferralCode: async function (referral_code, customer_id) {
    const [results] = await db.query(
      `
        UPDATE customers SET referral_code = ? WHERE id = ?
      `,
      [referral_code, customer_id]
    );
    return results;
  },
  changePassword: async function (newPassword, email) {
    const [results] = await db.query(
      `
        UPDATE customers SET password = ? WHERE email = ?
      `,
      [newPassword, email]
    );
    return results;
  },
  deleteCustomerByEmail: async function (email) {
    const [results] = await db.query(`DELETE FROM customers WHERE email = ?`, [
      email,
    ]);
    return results;
  },
  getCustomerProfileByEmail: async function (email) {
    const [results] = await db.query(
      `SELECT 
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
        WHERE c.email = ?
      `,
      [email]
    );
    return results[0];
  },
  getCustomerForAuth: async function (email) {
    const [results] = await db.query(
      `SELECT 
        id
        , email
        , password
        , isActive
       FROM customers WHERE email = ?
      `,
      [email]
    );
    return results[0];
  },
  isCustomerActive: async function (email) {
    const [results] = await db.query(
      `SELECT isActive FROM customers WHERE email = ?`,
      [email]
    );
    return results[0].isActive;
  },
  isEmailExists: async function (email) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM customers WHERE email = ?`,
      [email]
    );
    return results[0].isExist;
  },
  isReferralCodeExist: async function (referral_code) {
    const [results] = await db.query(
      `SELECT count(referral_code) as isExist FROM customers WHERE referral_code = ?`,
      [referral_code]
    );
    return results[0].isExist;
  },
  isValidCustomer: async function (id) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM customers WHERE id = ? AND isActive = 1`,
      [id]
    );
    return results[0].isExist;
  },
  registerCustomer: async function (
    id,
    email,
    password,
    name,
    address,
    telephone
  ) {
    const [results] = await db.query(
      `
        INSERT INTO customers(id, email, password, name, address, telephone)
        VALUES(?, ?, ?, ?, ?, ?)
    `,
      [id, email, password, name, address, telephone]
    );
  },
  updateCustomer: async function (id, name, address, telephone) {
    const [results] = await db.query(
      `
        UPDATE customers
        SET name = ?, address = ?, telephone = ?
        WHERE id = ?
    `,
      [name, address, telephone, id]
    );
    return results;
  },
};

export default CustomerQuery;
