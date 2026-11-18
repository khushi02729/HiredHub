const fs = require('fs');
const path = require('path');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

// basename() guards against path traversal even though filenames are server-generated.
const removeFile = (dir, filename) =>
  filename ? fs.promises.unlink(path.join(dir, path.basename(filename))).catch(() => {}) : Promise.resolve();

module.exports = { UPLOAD_DIR, AVATAR_DIR, removeFile, MAX_RESUMES: 10 };
