const express = require('express');
const router = express.Router();
const { getAllContent, createContent, updateContent, deleteContent } = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllContent);
router.post('/', protect, authorize('Admin', 'Manager'), createContent);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateContent);
router.delete('/:id', protect, authorize('Admin', 'Manager'), deleteContent);

module.exports = router;
