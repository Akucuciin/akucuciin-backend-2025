import db from "../connection.mjs";

const AuthQuery = {
  addRefreshToken: async function (id, refreshToken) {
    const [results] = await db.query(
      `
        INSERT INTO authentications(id, refresh_token)
        VALUES(?, ?)
    `,
      [id, refreshToken]
    );
  },
  deleteRefreshToken: async function (refreshToken) {
    const [results] = await db.query(
      `
        DELETE FROM authentications WHERE refresh_token = ?
    `,
      [refreshToken]
    );
  },
  isRefreshTokenExists: async function (refreshToken) {
    const [results] = await db.query(
      `
        SELECT count(refresh_token) as isExist from authentications
        WHERE refresh_token = ?
    `,
      [refreshToken]
    );
    return results[0].isExist;
  },
  updateRefreshTokenLogin: async function (id, refreshToken) {
    const [results] = await db.query(
      `
        UPDATE authentications SET refresh_token = ?
        WHERE id = ?
    `,
      [refreshToken, id]
    );
  },
  updateRefreshToken: async function (id, refreshToken) {
    const [results] = await db.query(
      `
        UPDATE authentications SET refresh_token = ?
        WHERE id = ?
    `,
      [refreshToken, id]
    );
  },
};

export default AuthQuery;
