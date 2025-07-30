const jwt = require('jsonwebtoken');
require('dotenv').config();

function signToken(payload) {
  // embeds userId, companyId, role
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
