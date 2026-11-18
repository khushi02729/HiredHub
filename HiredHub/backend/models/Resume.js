const mongoose = require('mongoose');
const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimeType: String,
  size: Number,
  isPrimary: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Resume', resumeSchema);
