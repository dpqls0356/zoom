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
//insert의 결과에는 생성객체는 포함되지않음
export const create = async ({ userId, kakaoId, nickname, profile_url }) => {
  const [result] = await db.query(
    "INSERT INTO users (user_id,kakao_id, nickname,profile_url) VALUES (?,?, ?,?)",
    [userId, kakaoId, nickname, profile_url]
  );

  return {
    id: result.insertId,
    user_id: userId,
    kakao_id: kakaoId,
    nickname,
    profile_url,
  };
};

export const logout = async (refreshToken) => {
  await db.query("UPDATE refresh_tokens SET revoked = true WHERE token = ?", [
    refreshToken,
  ]);
};
