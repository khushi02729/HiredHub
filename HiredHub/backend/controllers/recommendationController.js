const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { computeMatch, WEIGHTS } = require('../utils/matching');

exports.getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 20);
  const applied = await Application.distinct('job', { applicant: req.user._id });
  const jobs = await Job.find({ status: 'active', _id: { $nin: applied } }).sort({ createdAt: -1 }).limit(300).lean();
  const ranked = jobs
    .map((j) => ({ ...j, match: computeMatch(req.user, j) }))
    .filter((j) => j.match.matchPercent > 0)
    .sort((a, b) => b.match.matchPercent - a.match.matchPercent)
    .slice(0, limit);
  const saved = new Set((await SavedJob.find({ user: req.user._id, job: { $in: ranked.map((j) => j._id) } }).select('job').lean()).map((s) => String(s.job)));
  ranked.forEach((j) => { j.isSaved = saved.has(String(j._id)); });
  res.json({ success: true, weights: WEIGHTS, jobs: ranked });
});

exports.getJobMatch = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId).lean();
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, match: computeMatch(req.user, job) });
});
