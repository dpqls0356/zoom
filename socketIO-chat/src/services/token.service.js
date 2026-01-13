import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import * as refreshTokenModel from "../models/mysql/refreshToken.model.js";

export const createToken = async (user, meta) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await refreshTokenModel.refreshSave({
    user_id: user.id,
    token: refreshToken,
    user_agent: meta.userAgent,
    ip_address: meta.ip,
    expires_at: new Date(Date.now() + 7 * 86400000),
  });

  return { accessToken, refreshToken };
};
