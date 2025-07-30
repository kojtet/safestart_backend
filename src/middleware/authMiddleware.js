const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

module.exports = async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token.' });

    const payload = verifyToken(token);  // throws if invalid
    const user = await userModel.findById(payload.userId);
    if (!user || !user.is_active) return res.status(401).json({ message: 'User not found.' });

    // attach to request for downstream controllers
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
