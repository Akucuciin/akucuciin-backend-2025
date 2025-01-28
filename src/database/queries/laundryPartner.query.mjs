import db from "../connection.mjs";

const LaundryPartnerQuery = {
  delete: async function (id) {
    const [results] = await db.query(
      `DELETE FROM laundry_partners WHERE id = ?`,
      [id]
    );
    return results;
  },
  getById: async function (id) {
    const [results] = await db.query(
      `
    SELECT 
      id, 
      name, 
      email, 
      telephone, 
      address, 
      city,
      area,
      latitude, 
      longitude
    FROM laundry_partners
    WHERE id = ?
  `,
      [id]
    );
    return results[0];
  },
  isEmailExists: async function (email) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM laundry_partners WHERE email = ?`,
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
    city,
    area,
    latitude,
    longitude
  ) {
    const [results] = await db.query(
      `
      INSERT INTO laundry_partners(
        id, 
        name, 
        email, 
        password, 
        telephone, 
        address, 
        city,
        area,
        latitude, 
        longitude
      )
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        name,
        email,
        password,
        telephone,
        address,
        city,
        area,
        latitude,
        longitude,
      ]
    );
  },
  update: async function (
    id,
    name,
    telephone,
    address,
    city,
    area,
    latitude,
    longitude
  ) {
    const [results] = await db.query(
      `
      UPDATE laundry_partners
      SET name = ?, address = ?, telephone = ?, city = ?, area = ?, latitude = ?, longitude = ?
      WHERE id = ?
  `,
      [name, address, telephone, city, area, latitude, longitude, id]
    );
    return results;
  },
};

export default LaundryPartnerQuery;
