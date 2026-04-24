export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "tokoku_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};
