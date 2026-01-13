import jwt from "jsonwebtoken";
import crypto from "crypto";

// 액세스 토큰 생성
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      user_id: user.user_id,
      nickname: user.nickname,
      profile_url: user.profile_url,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// 리프레시 토큰 생성
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex"); // 길고 예측 불가
};
