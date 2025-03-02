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
      description,
      telephone, 
      address, 
      city,
      area,
      maps_pinpoint,
      latitude, 
      longitude,
      created_at,
      updated_at,
      is_active
    FROM laundry_partners
    WHERE id = ?
  `,
      [id]
    );
    return results[0];
  },
  getPackagesOfPartnerById: async function (laundry_partner_id) {
    const [results] = await db.query(
      `
      SELECT id, name, description, features, price_text FROM laundry_partners_packages
      WHERE laundry_partner_id = ?
      `,
      [laundry_partner_id]
    );
    return results;
  },
  getPackageOfPartnerById: async function (laundry_partner_id, id) {
    const [results] = await db.query(
      `
      SELECT id, name, description, features, price_text FROM laundry_partners_packages
      WHERE laundry_partner_id = ? AND id = ?
      `,
      [laundry_partner_id, id]
    );
    return results[0];
  },
  getPartnerForAuth: async function (email) {
    const [results] = await db.query(
      `
      SELECT id, email, password FROM laundry_partners
      WHERE email = ?
      `,
      [email]
    );
    return results[0];
  },
  getPartnersByCity: async function (city) {
    const [results] = await db.query(
      `
    SELECT 
      id, 
      name, 
      email, 
      description,
      telephone, 
      address, 
      city,
      area,
      maps_pinpoint,
      latitude, 
      longitude,
      created_at,
      updated_at
    FROM laundry_partners
    WHERE city = ? AND is_active = 1
  `,
      [city]
    );
    return results;
  },
  getPartnersLocations: async function () {
    const [results] = await db.query(`
    SELECT city, area FROM laundry_partners
    ORDER BY city, area
    `);
    return results;
  },
  isEmailExists: async function (email) {
    const [results] = await db.query(
      `SELECT count(email) as isExist FROM laundry_partners WHERE email = ?`,
      [email]
    );
    return results[0].isExist;
  },
  isValidPartner: async function (id) {
    const [results] = await db.query(
      `SELECT count(id) as isExist FROM laundry_partners WHERE id = ?`,
      [id]
    );
    return results[0].isExist;
  },
  register: async function (
    id,
    name,
    email,
    password,
    description,
    telephone,
    address,
    maps_pinpoint,
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
        description,
        telephone, 
        address, 
        maps_pinpoint,
        city,
        area,
        latitude, 
        longitude
      )
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `,
      [
        id,
        name,
        email,
        password,
        description,
        telephone,
        address,
        maps_pinpoint,
        city,
        area,
        latitude,
        longitude,
      ]
    );
  },
  update: async function (
    email,
    id,
    name,
    description,
    telephone,
    address,
    maps_pinpoint,
    city,
    area,
    latitude,
    longitude
  ) {
    const [results] = await db.query(
      `
      UPDATE laundry_partners
      SET email = ?, name = ?, address = ?, description = ?, telephone = ?, city = ?, area = ?, latitude = ?, longitude = ?, maps_pinpoint = ?
      WHERE id = ?
  `,
      [
        email,
        name,
        address,
        description,
        telephone,
        city,
        area,
        latitude,
        longitude,
        maps_pinpoint,
        id,
      ]
    );
    return results;
  },
  updatePackage: async function (
    package_id,
    name,
    description,
    features,
    price_text
  ) {
    const [results] = await db.query(
      `
        UPDATE laundry_partners_packages
        SET name = ?, description = ?, features = ?, price_text = ?
        WHERE id = ?
      `,
      [name, description, features, price_text, package_id]
    );
    return results;
  },
};

export default LaundryPartnerQuery;
