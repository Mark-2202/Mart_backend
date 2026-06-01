const express = require('express');
const router = express.Router();
const { getSalesReport, getInventoryReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/sales', protect, authorize('admin', 'manager'), getSalesReport);
router.get('/inventory', protect, authorize('admin', 'manager'), getInventoryReport);

module.exports = router;