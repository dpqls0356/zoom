export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  if (accessToken) {
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  if (refreshToken) {
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth/refresh",
      maxAge: 7 * 86400000,
    });
  }
};
