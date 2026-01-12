import db from "../../config/mysql.js";

export const findByKakaoId = async (kakaoId) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE kakao_id = ?", [
      kakaoId,
    ]);
    return rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const create = async ({ userId, kakaoId, nickname, profile_url }) => {
  const [result] = await db.query(
    "INSERT INTO users (user_id,kakao_id, nickname,profile_url) VALUES (?,?, ?,?)",
    [userId, kakaoId, nickname, profile_url]
  );

  return {
    id: result.id,
    user_id: result.user_id,
    profile_url,
    nickname,
  };
};
