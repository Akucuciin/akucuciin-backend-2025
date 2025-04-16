import db from "../connection.mjs"

const MitraQuery = {
    getMitraForAuth : async function (email) {
        const[results] = await db.query(`SELECT * FROM laundry_partners WHERE email = ?`, [
            email,
        ]);
        return results[0];
    }
}

export default MitraQuery;
