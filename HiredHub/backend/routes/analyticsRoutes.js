const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/analyticsController');
router.use(protect);
router.get('/seeker', authorize('seeker'), c.seeker);
router.get('/recruiter', authorize('recruiter'), c.recruiter);
module.exports = router;
