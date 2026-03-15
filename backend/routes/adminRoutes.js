const express = require('express');
const { protect, onlyAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

// @desc    Get dashboard advanced aggregation stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, onlyAdmin, adminController.getDashboardStats);
router.get('/analytics', protect, onlyAdmin, adminController.getAnalytics);

module.exports = router;
