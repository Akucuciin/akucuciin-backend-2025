import db from '../connection.mjs';

const DriverQuery = {
  deleteById: async function (id) {
    const [results] = await db.query(
      `
      DELETE FROM drivers WHERE id = ?
      `,
      [id]
    );
  },
  getById: async function (id) {
    const [results] = await db.query(
      `
      SELECT * FROM drivers WHERE id = ?
      `,
      [id]
    );
    return results[0];
  },
  getByEmailForAuth: async function (email) {
    const [results] = await db.query(
      `
      SELECT id, email, password FROM drivers WHERE email = ?
      `,
      [email]
    );
    return results[0];
  },
  getAll: async function () {
    const [results] = await db.query(
      `
      SELECT * FROM drivers
      `
    );
    return results;
  },
  isEmailExists: async function (email) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM drivers WHERE email = ?`,
      [email]
    );
    return results[0].isExist;
  },
  isValidDriver: async function (id) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM drivers WHERE id = ?`,
      [id]
    );
    return results[0].isExist;
  },
  register: async function (
    id,
    name,
    email,
    password,
    telephone,
    address,
    city
  ) {
    const [results] = await db.query(
      `
        INSERT INTO drivers(id, name, email, password, telephone, address, city)
        VALUES(?, ?, ?, ?, ?, ?, ?)
    `,
      [id, name, email, password, telephone, address, city]
    );
    return results;
  },
  update: async function (driver_id, name, email, telephone, address, city) {
    const [results] = await db.query(
      `
      UPDATE drivers SET name = ?, email = ?, telephone = ?, address = ?, city = ?
      WHERE id = ?
    `,
      [name, email, telephone, address, city, driver_id]
    );
    return results;
  },
};

export default DriverQuery;
