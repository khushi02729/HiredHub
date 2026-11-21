const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { resumeUpload } = require('../middleware/upload');
const c = require('../controllers/resumeController');
router.use(protect);
router.get('/:id/download', c.download); // owner, or the recruiter the resume was submitted to
router.use(authorize('seeker'));
router.get('/', c.list);
router.post('/', resumeUpload, c.upload);
router.put('/:id', resumeUpload, c.replace);
router.patch('/:id/primary', c.setPrimary);
router.delete('/:id', c.remove);
module.exports = router;
