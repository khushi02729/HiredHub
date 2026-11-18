const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const ApiError = require('../utils/ApiError');
const { UPLOAD_DIR, AVATAR_DIR } = require('../utils/files');

// Stored names are random and use an extension derived from the validated MIME type,
// never the client-supplied name.
const make = ({ dir, allowed, maxSize, message }) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + allowed[file.mimetype]),
  }),
  limits: { fileSize: maxSize, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const expected = allowed[file.mimetype];
    const ok = expected && (ext === expected || (expected === '.jpg' && ext === '.jpeg'));
    cb(ok ? null : new ApiError(422, message), !!ok);
  },
});

exports.resumeUpload = make({
  dir: UPLOAD_DIR, maxSize: 5 * 1024 * 1024, message: 'Only PDF, DOC or DOCX files are allowed',
  allowed: {
    'application/pdf': '.pdf', 'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  },
}).single('resume');

exports.avatarUpload = make({
  dir: AVATAR_DIR, maxSize: 2 * 1024 * 1024, message: 'Only JPG, PNG or WEBP images are allowed',
  allowed: { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' },
}).single('avatar');
