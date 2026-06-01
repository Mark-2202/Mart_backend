const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc  Get all orders
// @route GET /api/orders
// @access Private
const getOrders = async (req, res, next) => {
  try {
    const { status, customerId, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name sku')
      .populate('userid', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc  Get order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name sku')
      .populate('userid', 'name');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc  Create order
// @route POST /api/orders
// @access Private
const createOrder = async (req, res, proceed) => {
  try {
    const { customerId, items, tax } = req.body;

    // Validate customer existence
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
      }
    }

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404);
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const taxAmount = tax ?? 0;
    const total = subtotal + taxAmount;

    const order = await Order.create({
      customerId,
      items: orderItems,
      subtotal,
      tax: taxAmount,
      total,
      status: 'completed',
      userid: req.user._id
    });

    // Award loyalty points (1 point per $1 spent)
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { loyaltyPoints: Math.floor(total) }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    proceed(error);
  }
};

// @desc  Update order status
// @route PATCH /api/orders/:id/status
// @access Private (admin, manager)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Restore stock on cancellation
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus };
