const express = require('express');
const router = express.Router();
const { login, getMe, getUsers, createUser, deleteUser, updateUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);

// Admin / Manager routes
router.get('/users', protect, authorize('Admin', 'Manager'), getUsers);
router.post('/users', protect, authorize('Admin'), createUser);
router.put('/users/:id', protect, authorize('Admin'), updateUser);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
