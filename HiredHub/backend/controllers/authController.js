const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

const send = (res, user, status = 200) =>
  res.status(status).json({ success: true, token: signToken(user._id, user.role), user });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'An account with this email already exists');
  const isRecruiter = role === 'recruiter';
  const user = await User.create({
    name, email, password, role: isRecruiter ? 'recruiter' : 'seeker',
    ...(isRecruiter ? { company: { name: companyName } } : {}),
  });
  send(res, user, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (role && user.role !== role) throw new ApiError(403, `This account is registered as a ${user.role}`);
  send(res, user);
});

exports.me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));
