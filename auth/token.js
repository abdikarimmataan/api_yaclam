const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  generateToken: (userId, accountType) => {
    const payload = { userId, accountType };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "1d",
      algorithm: "HS256",
      issuer: process.env.JWT_ISSUER || "YACLAM",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
      algorithm: "HS256",
    });
    return { accessToken, refreshToken };
  },

  validateToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER || "YACLAM",
      });
    } catch {
      return null;
    }
  },

  validateRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return null;
    }
  },
};
