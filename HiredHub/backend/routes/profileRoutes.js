const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');
const c = require('../controllers/profileController');
const url = (f) => body(f).optional({ values: 'falsy' }).isURL().withMessage(`${f} must be a valid URL`);

router.use(protect);
router.get('/', c.get);
router.put('/', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).matches(/^[+\d][\d\s-]{6,17}$/).withMessage('Enter a valid phone number'),
  body('skills').optional().isArray({ max: 50 }).withMessage('Skills must be a list'),
  body('preferredLocations').optional().isArray({ max: 20 }).withMessage('Locations must be a list'),
  body('experienceYears').optional().isFloat({ min: 0, max: 60 }).withMessage('Experience must be between 0 and 60 years'),
  body('expectedSalary').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Expected salary must be positive'),
  url('linkedin'), url('github'), url('portfolio'),
], validate, c.update);
router.put('/password', [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isString().isLength({ min: 8, max: 128 }).withMessage('New password must be 8 to 128 characters'),
], validate, c.changePassword);
router.post('/avatar', avatarUpload, c.uploadAvatar);
module.exports = router;
