const Order = require('../models/Order');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc  Generate sales report
// @route GET /api/reports/sales
// @access Private (admin, manager)
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const filter = { status: 'completed' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    let groupFormat;
    if (groupBy === 'month') {
      groupFormat = { $month: '$createdAt' };
    } else if (groupBy === 'year') {
      groupFormat = { $year: '$createdAt' };
    } else {
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }
    
    const salesData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const summary = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);
    
    res.json({
      data: salesData,
      summary: summary[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Generate inventory report
// @route GET /api/reports/inventory
// @access Private (admin, manager)
const getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .sort({ stock: 1 });
    
    const summary = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      lowStockCount: products.filter(p => p.stock <= 10).length,
      outOfStockCount: products.filter(p => p.stock === 0).length
    };
    
    res.json({
      products,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, getInventoryReport };