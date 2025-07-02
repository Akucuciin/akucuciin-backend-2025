import db from '../connection.mjs';

const LaundryPartnerQuery = {
  delete: async function (id) {
    const [results] = await db.query(
      `UPDATE laundry_partners
        SET is_active = 0 
        WHERE id = ?`,
      [id]
    );
    return results;
  },
  getById: async function (id, conn = db) {
    const [results] = await conn.query(
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
    AND is_active = 1
  `,
      [id]
    );
    return results[0];
  },
  getPackagesOfPartnerById: async function (laundry_partner_id) {
    const [results] = await db.query(
      `
      SELECT id, name, description, features, price_text FROM laundry_partners_packages
      WHERE laundry_partner_id = ? AND deleted_at IS NULL
      `,
      [laundry_partner_id]
    );
    return results;
  },
  getPackagesTopPicks: async function (laundry_partner_id) {
    const [results] = await db.query(
      `
      SELECT 
          lpp.id,
          lpp.name,
          lpp.description,
          lpp.features,
          lpp.price_text,
          top_packages.total_orders,
          top_packages.avg_rating
      FROM 
          laundry_partners_packages lpp
      JOIN (
          SELECT 
              o.package_id,
              COUNT(*) AS total_orders,
              ROUND(AVG(CASE WHEN o.rating > 0 THEN o.rating ELSE NULL END), 2) AS avg_rating
          FROM 
              orders o
          WHERE 
              o.laundry_partner_id = ?
              AND o.status != 'batal'
          GROUP BY 
              o.package_id
          ORDER BY 
              total_orders DESC
          LIMIT 3
      ) top_packages ON lpp.id = top_packages.package_id
      WHERE
          lpp.deleted_at IS NULL;
      `,
      [laundry_partner_id]
    );
    return results;
  },
  getPackageOfPartnerById: async function (laundry_partner_id, id, conn = db) {
    const [results] = await conn.query(
      `
      SELECT id, name, description, features, price_text FROM laundry_partners_packages
      WHERE laundry_partner_id = ? AND id = ? AND deleted_at IS NULL
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
    WHERE is_active = 1
    ORDER BY city, area
    `);
    return results;
  },
  getPartnerAverageRating: async function (laundry_partner_id) {
    const [results] = await db.query(
      `
        SELECT 
            laundry_partner_id,
            ROUND(AVG(CASE WHEN rating > 0 THEN rating ELSE NULL END), 2) AS avg_rating,
            COUNT(CASE WHEN rating > 0 THEN 1 ELSE NULL END) AS total_reviews
        FROM 
            orders
        WHERE 
            laundry_partner_id = ?
            AND status != 'batal'
        GROUP BY 
            laundry_partner_id;
      `,
      [laundry_partner_id]
    );
    return results[0];
  },
  getPartnerReviews: async function (laundry_partner_id) {
    const [results] = await db.query(
      `
      SELECT 
          o.id,
          o.rating,
          o.review,
          c.name AS customer_name,
          p.name AS package_name
      FROM 
          orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN laundry_partners_packages p ON o.package_id = p.id
      WHERE 
          o.laundry_partner_id = ?
          AND o.rating > 0
      ORDER BY 
          o.created_at DESC;
      `,
      [laundry_partner_id]
    );
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
