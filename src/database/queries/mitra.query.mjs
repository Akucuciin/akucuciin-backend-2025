import db from "../connection.mjs"

const MitraQuery = {
    getMitraForAuth : async function (email) {
        const[results] = await db.query(`SELECT * FROM laundry_partners WHERE email = ?`, [
            email,
        ]);
        return results[0];
    },
    getMitraProfile: async function (laundry_partner_id) {
        const [results] = await db.query(
            `SELECT id, name, email, description, telephone, address, maps_pinpoint, city, area, latitude, longitude, created_at, updated_at FROM laundry_partners WHERE id = ?`, [
                laundry_partner_id
            ]
        );
        return results[0];
    },
    
}

export default MitraQuery;
