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
router.get('/sales-chart', getSalesChart);
router.get('/top-products', getTopProducts);
router.get('/recent-orders', getRecentOrders);

module.exports = router;