import db from '../database/connection.mjs';

export async function withTransaction(callback) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // callback will executed after this
    const result = await callback(connection);

    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
