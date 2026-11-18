const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const { AVATAR_DIR, removeFile } = require('../utils/files');

const FIELDS = ['name', 'phone', 'headline', 'experienceYears', 'education', 'expectedSalary', 'linkedin', 'github', 'portfolio'];
const cleanList = (arr) => [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];

exports.get = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));

exports.update = asyncHandler(async (req, res) => {
  const user = req.user;
  FIELDS.forEach((k) => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
  if (Array.isArray(req.body.skills)) user.skills = cleanList(req.body.skills);
  if (Array.isArray(req.body.preferredLocations)) user.preferredLocations = cleanList(req.body.preferredLocations);
  if (req.body.email && req.body.email !== user.email) {
    if (await User.exists({ email: req.body.email, _id: { $ne: user._id } })) throw new ApiError(409, 'That email is already in use');
    user.email = req.body.email;
  }
  if (user.role === 'recruiter' && req.body.company) {
    user.company = { ...(user.company ? user.company.toObject() : {}), ...req.body.company };
  }
  await user.save();
  res.json({ success: true, user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) throw new ApiError(401, 'Current password is incorrect');
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated', token: signToken(user._id, user.role) });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Please choose an image');
  const previous = req.user.avatar;
  req.user.avatar = `/uploads/avatars/${req.file.filename}`;
  await req.user.save();
  if (previous && previous.startsWith('/uploads/avatars/')) await removeFile(AVATAR_DIR, previous);
  res.json({ success: true, user: req.user });
});
