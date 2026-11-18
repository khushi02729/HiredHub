const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('job').lean();
  const rows = saved.filter((s) => s.job);
  const applied = new Set((await Application.distinct('job', { applicant: req.user._id })).map(String));
  const jobs = rows.map((s) => ({ ...s.job, isSaved: true, savedAt: s.createdAt, hasApplied: applied.has(String(s.job._id)) }));
  res.json({ success: true, jobs });
});

exports.save = asyncHandler(async (req, res) => {
  if (!(await Job.exists({ _id: req.params.jobId }))) throw new ApiError(404, 'Job not found');
  await SavedJob.updateOne({ user: req.user._id, job: req.params.jobId }, { $setOnInsert: {} }, { upsert: true });
  res.status(201).json({ success: true, isSaved: true });
});

exports.unsave = asyncHandler(async (req, res) => {
  await SavedJob.deleteOne({ user: req.user._id, job: req.params.jobId });
  res.json({ success: true, isSaved: false });
});
