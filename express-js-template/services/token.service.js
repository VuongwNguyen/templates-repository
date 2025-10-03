const jwt = require("jsonwebtoken");
require("dotenv").config();

class TokenService {
  generateToken(payload) {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, {
      expiresIn: "7d",
    });

    const accessToken = jwt.sign(payload, process.env.ACCESS_JWT_SECRET, {
      expiresIn: "15m",
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new TokenService();
