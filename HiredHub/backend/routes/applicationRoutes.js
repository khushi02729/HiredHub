const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { resumeUpload } = require('../middleware/upload');
const Application = require('../models/Application');
const c = require('../controllers/applicationController');

router.use(protect);
const date = body('interviewDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid interview date');

router.get('/job/:jobId', authorize('recruiter'), c.getApplicantsForJob);
router.get('/', authorize('seeker'), c.getMine);
// authorize runs before the upload so unauthorised users cannot write files
router.post('/', authorize('seeker'), resumeUpload, [
  body('jobId').isMongoId().withMessage('A valid job is required'),
  body('resumeId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid resume'),
  body('coverLetter').optional().isLength({ max: 4000 }).withMessage('Cover letter is too long (max 4000 characters)'),
], validate, c.apply);
router.get('/:id', c.getOne);
router.patch('/:id/status', [
  body('status').isIn(Application.STATUSES).withMessage('Invalid status'),
  body('note').optional().isLength({ max: 500 }), date,
], validate, c.updateStatus);
router.patch('/:id/shortlist', authorize('recruiter'), [body('shortlisted').isBoolean().withMessage('shortlisted must be true or false')], validate, c.shortlist);
router.patch('/:id', [body('notes').optional().isLength({ max: 2000 }).withMessage('Notes are too long (max 2000 characters)'), date], validate, c.update);
router.delete('/:id', authorize('seeker'), c.remove);
module.exports = router;
