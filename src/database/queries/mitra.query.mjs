import db from "../connection.mjs";

const MitraQuery = {
  getMitraForAuth: async function (email) {
    const [results] = await db.query(`SELECT * FROM laundry_partners WHERE email = ?`, [email]);
    return results[0];
  },
  getMitraProfile: async function (laundry_partner_id) {
    const [results] = await db.query(`SELECT id, name, email, description, telephone, address, maps_pinpoint, city, area, latitude, longitude, created_at, updated_at FROM laundry_partners WHERE id = ?`, [laundry_partner_id]);
    return results[0];
  },
  updateMitraProfile: async function (id, name, description, telephone, address, maps_pinpoint, city, area, latitude, longitude) {
    const [results] = await db.query(
      `UPDATE laundry_partners SET name = ?, address = ?, description = ?, telephone = ?, city = ?, area = ?, latitude = ?, longitude = ?, maps_pinpoint = ?
      WHERE id = ?`,
      [name, address, description, telephone, city, area, latitude, longitude, maps_pinpoint, id]
    );
    return results;
  },
  
};

export default MitraQuery;
