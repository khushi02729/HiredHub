const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  school: String, degree: String, field: String, startYear: Number, endYear: Number,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'] },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['seeker', 'recruiter'], default: 'seeker', index: true },
  phone: { type: String, trim: true },
  avatar: String,
  headline: { type: String, maxlength: 120 },
  skills: [{ type: String, trim: true }],
  experienceYears: { type: Number, min: 0, max: 60, default: 0 },
  education: [educationSchema],
  preferredLocations: [{ type: String, trim: true }],
  expectedSalary: { type: Number, min: 0 },
  linkedin: String, github: String, portfolio: String,
  company: { name: String, logo: String, website: String, size: String, about: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (plain) { return bcrypt.compare(plain, this.password); };

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
