const express = require('express');
const router = express.Router();
const { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus } = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'manager'), getPurchaseOrders);
router.get('/:id', protect, authorize('admin', 'manager'), getPurchaseOrderById);
router.post('/', protect, authorize('admin', 'manager'), createPurchaseOrder);
router.patch('/:id/status', protect, authorize('admin', 'manager'), updatePurchaseOrderStatus);

module.exports = router;
