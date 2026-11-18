const mongoose = require('mongoose');
const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

const historySchema = new mongoose.Schema({
  status: { type: String, enum: STATUSES },
  note: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  by: { type: String, enum: ['seeker', 'recruiter'] },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  coverLetter: { type: String, maxlength: 4000 },
  status: { type: String, enum: STATUSES, default: 'Applied', index: true },
  shortlisted: { type: Boolean, default: false },
  notes: { type: String, maxlength: 2000 },
  interviewDate: Date,
  history: [historySchema],
}, { timestamps: true });

// Blocks duplicate applications at the database level.
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

applicationSchema.statics.STATUSES = STATUSES;
module.exports = mongoose.model('Application', applicationSchema);
