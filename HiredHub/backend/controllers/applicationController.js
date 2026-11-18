const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { UPLOAD_DIR, removeFile, MAX_RESUMES } = require('../utils/files');
const { computeMatch } = require('../utils/matching');

const STATUSES = Application.STATUSES;
const JOB_FIELDS = 'title company location salary workMode employmentType category skills status';
const APPLICANT_FIELDS = 'name email phone avatar headline skills experienceYears education preferredLocations expectedSalary linkedin github portfolio';
const RESUME_FIELDS = 'originalName mimeType size';
const idOf = (x) => String(x && x._id ? x._id : x);

const full = (id) => Application.findById(id)
  .populate('job', JOB_FIELDS).populate('resume', RESUME_FIELDS).populate('applicant', APPLICANT_FIELDS);

const loadAccessible = async (id, user) => {
  const app = await Application.findById(id);
  if (!app) throw new ApiError(404, 'Application not found');
  const uid = String(user._id);
  if (idOf(app.applicant) !== uid && idOf(app.recruiter) !== uid) throw new ApiError(403, 'Not allowed');
  return app;
};

// POST /api/applications (multipart: jobId, coverLetter, resume file OR resumeId)
exports.apply = asyncHandler(async (req, res) => {
  const uploaded = req.file;
  let keepFile = false;
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) throw new ApiError(404, 'Job not found');
    if (job.status !== 'active') throw new ApiError(400, 'This job is no longer accepting applications');
    if (await Application.exists({ job: job._id, applicant: req.user._id })) {
      throw new ApiError(409, 'You have already applied to this job');
    }
    let resume;
    if (uploaded) {
      if (await Resume.countDocuments({ user: req.user._id }) >= MAX_RESUMES) throw new ApiError(400, `You can store up to ${MAX_RESUMES} resumes`);
      resume = await Resume.create({
        user: req.user._id, originalName: uploaded.originalname, filename: uploaded.filename,
        mimeType: uploaded.mimetype, size: uploaded.size, isPrimary: !(await Resume.exists({ user: req.user._id })),
      });
      keepFile = true;
    } else if (req.body.resumeId) {
      resume = await Resume.findOne({ _id: req.body.resumeId, user: req.user._id });
      if (!resume) throw new ApiError(404, 'Resume not found');
    } else {
      throw new ApiError(422, 'Please attach a resume');
    }
    const app = await Application.create({
      job: job._id, applicant: req.user._id, recruiter: job.recruiter, resume: resume._id,
      coverLetter: req.body.coverLetter,
      history: [{ status: 'Applied', by: 'seeker', changedBy: req.user._id }],
    });
    res.status(201).json({ success: true, application: await full(app._id) });
  } catch (err) {
    if (uploaded && !keepFile) await removeFile(UPLOAD_DIR, uploaded.filename);
    throw err.code === 11000 ? new ApiError(409, 'You have already applied to this job') : err;
  }
});

// GET /api/applications?status=&q=
exports.getMine = asyncHandler(async (req, res) => {
  const { status, q } = req.query;
  const filter = { applicant: req.user._id };
  if (status && STATUSES.includes(status)) filter.status = status;
  let applications = await Application.find(filter).sort({ createdAt: -1 })
    .populate('job', JOB_FIELDS).populate('resume', RESUME_FIELDS).lean();
  if (q) {
    const needle = String(q).toLowerCase();
    applications = applications.filter((a) => a.job && `${a.job.title} ${a.job.company.name}`.toLowerCase().includes(needle));
  }
  const grouped = await Application.aggregate([
    { $match: { applicant: req.user._id } }, { $group: { _id: '$status', n: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  grouped.forEach((g) => { counts[g._id] = g.n; });
  res.json({ success: true, applications, counts });
});

exports.getOne = asyncHandler(async (req, res) => {
  const app = await loadAccessible(req.params.id, req.user);
  res.json({ success: true, application: await full(app._id) });
});

// PATCH /api/applications/:id/status — seekers move cards on their own tracker; recruiters update the pipeline.
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note, interviewDate } = req.body;
  const app = await loadAccessible(req.params.id, req.user);
  const isRecruiter = req.user.role === 'recruiter';
  if (app.status !== status) {
    app.status = status;
    app.history.push({ status, note, by: isRecruiter ? 'recruiter' : 'seeker', changedBy: req.user._id });
    if (isRecruiter && status === 'Rejected') app.shortlisted = false;
  }
  if (interviewDate !== undefined) app.interviewDate = interviewDate || undefined;
  await app.save();
  res.json({ success: true, application: await full(app._id) });
});

// PATCH /api/applications/:id — notes (applicant only) and interview date
exports.update = asyncHandler(async (req, res) => {
  const app = await loadAccessible(req.params.id, req.user);
  const { notes, interviewDate } = req.body;
  if (notes !== undefined) {
    if (idOf(app.applicant) !== String(req.user._id)) throw new ApiError(403, 'Only the applicant can edit notes');
    app.notes = notes;
  }
  if (interviewDate !== undefined) app.interviewDate = interviewDate || undefined;
  await app.save();
  res.json({ success: true, application: await full(app._id) });
});

exports.shortlist = asyncHandler(async (req, res) => {
  const app = await loadAccessible(req.params.id, req.user);
  if (idOf(app.recruiter) !== String(req.user._id)) throw new ApiError(403, 'Not allowed');
  app.shortlisted = !!req.body.shortlisted;
  app.history.push({ status: app.status, note: app.shortlisted ? 'Shortlisted' : 'Removed from shortlist', by: 'recruiter', changedBy: req.user._id });
  await app.save();
  res.json({ success: true, application: await full(app._id) });
});

exports.remove = asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, applicant: req.user._id });
  if (!app) throw new ApiError(404, 'Application not found');
  await app.deleteOne();
  res.json({ success: true, message: 'Application deleted' });
});

// GET /api/applications/job/:jobId — recruiter's applicants with explainable match score
exports.getApplicantsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  if (String(job.recruiter) !== String(req.user._id)) throw new ApiError(403, 'You can only view applicants for your own jobs');
  const filter = { job: job._id };
  if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.shortlisted === 'true') filter.shortlisted = true;
  const applicants = await Application.find(filter).sort({ shortlisted: -1, createdAt: -1 })
    .populate('applicant', APPLICANT_FIELDS).populate('resume', RESUME_FIELDS).lean();
  applicants.forEach((a) => { a.match = computeMatch(a.applicant, job); });
  res.json({ success: true, job: { _id: job._id, title: job.title, company: job.company, status: job.status }, applicants });
});
