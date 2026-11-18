const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['seeker', 'recruiter']).withMessage('Invalid role'),
  body('companyName').if(body('role').equals('recruiter')).trim().notEmpty().withMessage('Company name is required'),
], validate, c.register);

router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, c.login);

router.get('/me', protect, c.me);
module.exports = router;
