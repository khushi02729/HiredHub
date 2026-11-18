const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const c = require('../controllers/jobController');

const jobRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('workMode').isIn(['Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  body('employmentType').isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid employment type'),
  body('experienceLevel').isIn(['Entry', 'Mid', 'Senior', 'Lead']).withMessage('Invalid experience level'),
  body('salary.min').isFloat({ min: 0 }).withMessage('Minimum salary is required'),
  body('salary.max').isFloat({ min: 0 }).withMessage('Maximum salary is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('skills').isArray({ min: 1 }).withMessage('Add at least one skill'),
];

router.get('/', optionalAuth, c.getJobs);
router.get('/filters/options', c.getFilterOptions);
router.get('/mine', protect, authorize('recruiter'), c.getMyJobs);
router.post('/', protect, authorize('recruiter'), jobRules, validate, c.createJob);
router.get('/:id', optionalAuth, c.getJob);
router.put('/:id', protect, authorize('recruiter'), c.updateJob);
router.delete('/:id', protect, authorize('recruiter'), c.deleteJob);
module.exports = router;
