const jwt = require('jsonwebtoken');
require('dotenv').config();

function signToken(payload) {
  // embeds userId, companyId, role
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { 
    expiresIn: '30d',
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: '7d',
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });
}

module.exports = { signToken, verifyToken, signRefreshToken, verifyRefreshToken };
