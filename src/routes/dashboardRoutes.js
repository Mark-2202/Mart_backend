const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getRecentOrders
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'manager'), getDashboardStats);
router.get('/sales-chart', protect, getSalesChart);
router.get('/top-products', protect, getTopProducts);
router.get('/recent-orders', protect, getRecentOrders);

module.exports = router;