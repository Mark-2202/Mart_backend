const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// @desc  Get all purchase orders
// @route GET /api/purchase-orders
// @access Private (admin, manager)
const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('items.productId', 'name sku')
      .populate('userid', 'name')
      .sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (error) {
    next(error);
  }
};

// @desc  Get purchase order by ID
// @route GET /api/purchase-orders/:id
// @access Private (admin, manager)
const getPurchaseOrderById = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('items.productId', 'name sku price')
      .populate('userid', 'name');
    if (!po) {
      res.status(404);
      throw new Error('Purchase order not found');
    }
    res.json(po);
  } catch (error) {
    next(error);
  }
};

// @desc  Create purchase order
// @route POST /api/purchase-orders
// @access Private (admin, manager)
const createPurchaseOrder = async (req, res, next) => {
  try {
    const { name, items, tax } = req.body;

    let subtotal = 0;
    const poItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404);
        throw new Error(`Product ${item.productId} not found`);
      }
      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;
      poItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemSubtotal
      });
    }

    const taxAmount = tax ?? 0;
    const total = subtotal + taxAmount;

    const po = await PurchaseOrder.create({
      name,
      items: poItems,
      subtotal,
      tax: taxAmount,
      total,
      userid: req.user._id
    });

    res.status(201).json(po);
  } catch (error) {
    next(error);
  }
};

// @desc  Update purchase order status
// @route PATCH /api/purchase-orders/:id/status
// @access Private (admin, manager)
const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      res.status(404);
      throw new Error('Purchase order not found');
    }

    // Add stock when order is received
    if (status === 'received' && po.status !== 'received') {
      for (const item of po.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    po.status = status;
    const updated = await po.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus };
