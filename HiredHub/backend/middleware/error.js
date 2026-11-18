exports.notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => { // eslint-disable-line
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 422; message = Object.values(err.errors)[0].message; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid ID'; }
  if (err.code === 11000) { status = 409; message = 'Duplicate value: ' + Object.keys(err.keyValue || {}).join(', '); }
  if (err.name === 'MulterError') { status = 400; }
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message });
};
