const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/savedController');
router.use(protect, authorize('seeker'));
router.get('/', c.list);
router.post('/:jobId', c.save);
router.delete('/:jobId', c.unsave);
module.exports = router;
