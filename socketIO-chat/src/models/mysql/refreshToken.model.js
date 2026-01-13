import db from "../../config/mysql.js";
export const refreshSave = async ({
  user_id,
  token,
  user_agent,
  ip_address,
  expires_at,
}) => {
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)`,
    [user_id, token, user_agent, ip_address, expires_at]
  );
};
export const getRefreshToken = async (refreshToken) => {
  const [rows] = await db.query(
    `SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()
`,
    [refreshToken]
  );
  return rows[0];
};

export const deleteByToken = async (refreshToken) => {
  await db.query(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]);
};
