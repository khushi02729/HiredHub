const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Not authenticated');
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new ApiError(401, 'Invalid or expired token'); }
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'User no longer exists');
  req.user = user;
  next();
});

// Attaches req.user if a valid token is present; never fails the request.
exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch { /* ignore */ }
  next();
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to do that'));
  next();
};
