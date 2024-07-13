const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
console.log('JWT Secret:', secretKey);
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    console.log('JWT Secret:', secretKey); // Log the JWT secret key for debugging
    const decoded = jwt.verify(token.replace('Bearer ', ''), secretKey);
    req.user = await User.findById(decoded.user.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('JWT Error:', err.message); // Log the JWT error for debugging
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;


