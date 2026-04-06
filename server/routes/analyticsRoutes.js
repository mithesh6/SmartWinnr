const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardMetrics);

module.exports = router;
