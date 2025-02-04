import db from "../connection.mjs";

const DriverQuery = {
  isEmailExists: async function (email) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM drivers WHERE email = ?`,
      [email]
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
};

export default DriverQuery;
