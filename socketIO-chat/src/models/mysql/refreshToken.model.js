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
