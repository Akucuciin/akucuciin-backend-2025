import db from "../connection.mjs";

const LaundryPartnerImageQuery = {
  addImage: async function (id, partner_id, filepath) {
    const [results] = await db.query(
      `
        INSERT INTO laundry_partners_images(id, laundry_partner_id, filepath)
        VALUES(?, ?, ?)
        `,
      [id, partner_id, filepath]
    );
  },
  deleteImageById: async function (image_id) {
    const [results] = await db.query(
      `DELETE FROM laundry_partners_images WHERE id = ?`,
      [image_id]
    );
  },
  getImageById: async function (image_id) {
    const [results] = await db.query(
      `
        SELECT * FROM laundry_partners_images
        WHERE id = ?
        `,
      [image_id]
    );
    return results[0];
  },
  getImagesOfPartnerById: async function (partner_id) {
    const [results] = await db.query(
      `
        SELECT * FROM laundry_partners_images
        WHERE laundry_partner_id = ?
        `,
      [partner_id]
    );
    return results;
  },
};

export default LaundryPartnerImageQuery;
