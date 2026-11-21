const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);

// GET /api/jobs — public; filterable, sortable, paginated
exports.getJobs = asyncHandler(async (req, res) => {
  const { q, skills, location, minSalary, maxSalary, experience, type, workMode, company, sort = 'newest' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 9, 1), 50);

  const filter = { status: 'active' };
  const and = [];
  if (q) and.push({ $or: [
    { title: new RegExp(esc(q), 'i') }, { 'company.name': new RegExp(esc(q), 'i') }, { skills: new RegExp(esc(q), 'i') },
  ] });
  if (skills) and.push({ skills: { $in: list(skills).map((s) => new RegExp(`^${esc(s)}$`, 'i')) } });
  if (location) filter.location = new RegExp(esc(location), 'i');
  if (company) filter['company.name'] = new RegExp(esc(company), 'i');
  if (experience) filter.experienceLevel = { $in: list(experience) };
  if (type) filter.employmentType = { $in: list(type) };
  if (workMode) filter.workMode = { $in: list(workMode) };
  if (minSalary) filter['salary.max'] = { $gte: Number(minSalary) };
  if (maxSalary) filter['salary.min'] = { $lte: Number(maxSalary) };
  if (and.length) filter.$and = and;

  const sorts = { newest: { createdAt: -1 }, salaryHigh: { 'salary.max': -1 }, salaryLow: { 'salary.min': 1 } };
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort(Object.prototype.hasOwnProperty.call(sorts, sort) ? sorts[sort] : sorts.newest).skip((page - 1) * limit).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  if (req.user && req.user.role === 'seeker' && jobs.length) {
    const ids = jobs.map((j) => j._id);
    const [saved, applied] = await Promise.all([
      SavedJob.find({ user: req.user._id, job: { $in: ids } }).select('job').lean(),
      Application.find({ applicant: req.user._id, job: { $in: ids } }).select('job').lean(),
    ]);
    const s = new Set(saved.map((x) => String(x.job))), a = new Set(applied.map((x) => String(x.job)));
    jobs.forEach((j) => { j.isSaved = s.has(String(j._id)); j.hasApplied = a.has(String(j._id)); });
  }
  res.json({ success: true, jobs, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/jobs/filters/options — populates filter dropdowns
exports.getFilterOptions = asyncHandler(async (req, res) => {
  const [skills, locations, companies] = await Promise.all([
    Job.distinct('skills', { status: 'active' }), Job.distinct('location', { status: 'active' }),
    Job.distinct('company.name', { status: 'active' }),
  ]);
  res.json({ success: true, skills: skills.sort(), locations: locations.sort(), companies: companies.sort() });
});

exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('recruiter', 'name email avatar headline').lean();
  if (!job) throw new ApiError(404, 'Job not found');
  if (req.user && req.user.role === 'seeker') {
    job.isSaved = !!(await SavedJob.exists({ user: req.user._id, job: job._id }));
    job.hasApplied = !!(await Application.exists({ applicant: req.user._id, job: job._id }));
  }
  res.json({ success: true, job });
});

// ---- Recruiter-only ----
const FIELDS = ['title', 'company', 'location', 'workMode', 'employmentType', 'experienceLevel', 'minExperience',
  'salary', 'category', 'description', 'responsibilities', 'qualifications', 'skills', 'benefits', 'status'];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

exports.createJob = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  const own = req.user.company ? req.user.company.toObject() : {};
  data.company = { ...own, ...(data.company || {}) };
  const job = await Job.create({ ...data, recruiter: req.user._id });
  res.status(201).json({ success: true, job });
});

const ownJob = async (req) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (String(job.recruiter) !== String(req.user._id)) throw new ApiError(403, 'You can only manage your own jobs');
  return job;
};

exports.updateJob = asyncHandler(async (req, res) => {
  const job = await ownJob(req);
  Object.assign(job, pick(req.body));
  await job.save();
  res.json({ success: true, job });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await ownJob(req);
  await Promise.all([job.deleteOne(), Application.deleteMany({ job: job._id }), SavedJob.deleteMany({ job: job._id })]);
  res.json({ success: true, message: 'Job deleted' });
});

exports.getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 }).lean();
  const counts = await Application.aggregate([
    { $match: { recruiter: req.user._id } }, { $group: { _id: '$job', n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  jobs.forEach((j) => { j.applicantCount = map[String(j._id)] || 0; });
  res.json({ success: true, jobs });
});

// GET /api/jobs/stats/summary — public numbers for the landing page
exports.getStats = asyncHandler(async (req, res) => {
  const [jobs, companies, applications] = await Promise.all([
    Job.countDocuments({ status: 'active' }),
    Job.distinct('company.name', { status: 'active' }),
    Application.countDocuments(),
  ]);
  res.json({ success: true, stats: { jobs, companies: companies.length, applications } });
});
