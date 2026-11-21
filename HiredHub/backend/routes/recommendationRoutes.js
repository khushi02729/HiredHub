const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/recommendationController');
router.use(protect, authorize('seeker'));
router.get('/', c.getRecommendations);
router.get('/:jobId', c.getJobMatch);
module.exports = router;
