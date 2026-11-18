const fs = require('fs');
const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  if (req.file) fs.unlink(req.file.path, () => {}); // don't keep uploads from rejected requests
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  res.status(422).json({ success: false, message: errors[0].message, errors });
};
