const path = require('path');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { UPLOAD_DIR, removeFile, MAX_RESUMES } = require('../utils/files');

const fileMeta = (f) => ({ originalName: f.originalname, filename: f.filename, mimeType: f.mimetype, size: f.size });

exports.list = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ isPrimary: -1, createdAt: -1 }).lean();
  const usage = await Application.aggregate([
    { $match: { applicant: req.user._id } }, { $group: { _id: '$resume', n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(usage.map((u) => [String(u._id), u.n]));
  resumes.forEach((r) => { r.applicationCount = map[String(r._id)] || 0; });
  res.json({ success: true, resumes });
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Please choose a file to upload');
  if (await Resume.countDocuments({ user: req.user._id }) >= MAX_RESUMES) {
    await removeFile(UPLOAD_DIR, req.file.filename);
    throw new ApiError(400, `You can store up to ${MAX_RESUMES} resumes`);
  }
  const isPrimary = !(await Resume.exists({ user: req.user._id }));
  const resume = await Resume.create({ user: req.user._id, ...fileMeta(req.file), isPrimary });
  res.status(201).json({ success: true, resume });
});

const own = async (req) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');
  return resume;
};

// Replaces the file in place; applications that reference this resume will show the new file.
exports.replace = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Please choose a file to upload');
  let resume;
  try { resume = await own(req); } catch (e) { await removeFile(UPLOAD_DIR, req.file.filename); throw e; }
  const old = resume.filename;
  Object.assign(resume, fileMeta(req.file));
  await resume.save();
  await removeFile(UPLOAD_DIR, old);
  res.json({ success: true, resume });
});

exports.setPrimary = asyncHandler(async (req, res) => {
  const resume = await own(req);
  await Resume.updateMany({ user: req.user._id }, { isPrimary: false });
  resume.isPrimary = true;
  await resume.save();
  res.json({ success: true, resume });
});

exports.remove = asyncHandler(async (req, res) => {
  const resume = await own(req);
  const used = await Application.countDocuments({ resume: resume._id });
  if (used) throw new ApiError(409, `This resume is attached to ${used} application${used > 1 ? 's' : ''}. Upload a replacement instead of deleting it.`);
  await resume.deleteOne();
  await removeFile(UPLOAD_DIR, resume.filename);
  if (resume.isPrimary) {
    const next = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next) { next.isPrimary = true; await next.save(); }
  }
  res.json({ success: true, message: 'Resume deleted' });
});

// Owner can always download. A recruiter can only download resumes attached to applications for their jobs.
exports.download = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) throw new ApiError(404, 'Resume not found');
  const isOwner = String(resume.user) === String(req.user._id);
  if (!isOwner) {
    const allowed = req.user.role === 'recruiter' &&
      (await Application.exists({ resume: resume._id, recruiter: req.user._id }));
    if (!allowed) throw new ApiError(403, 'Not allowed to view this resume');
  }
  const disposition = req.query.inline === '1' ? 'inline' : 'attachment';
  res.sendFile(path.join(UPLOAD_DIR, path.basename(resume.filename)), {
    headers: {
      'Content-Type': resume.mimeType,
      'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(resume.originalName)}`,
      'X-Content-Type-Options': 'nosniff',
    },
  }, (err) => { if (err && !res.headersSent) res.status(404).json({ success: false, message: 'File missing on server' }); });
});
