const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const User = require('../models/User');

// @desc  Get dashboard statistics
// @route GET /api/dashboard/stats
// @access Private
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalOrders,
      todayOrders,
      totalProducts,
      lowStockCount,
      totalCustomers,
      activeUsers
    ] = await Promise.all([
      Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: 'completed', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: 'completed', createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: 'completed', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'completed', createdAt: { $gte: today } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lte: 10 }, isActive: true }),
      Customer.countDocuments(),
      User.countDocuments({ isActive: true })
    ]);
    
    res.json({
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        weekly: weeklyRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      },
      orders: {
        total: totalOrders,
        today: todayOrders
      },
      products: {
        total: totalProducts,
        lowStock: lowStockCount
      },
      customers: totalCustomers,
      users: activeUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get sales chart data
// @route GET /api/dashboard/sales-chart
// @access Private
const getSalesChart = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const daysArray = parseInt(days);
    
    const dates = [];
    for (let i = daysArray - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    
    const salesData = await Promise.all(dates.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const result = await Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: date, $lt: nextDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        date: date.toISOString().split('T')[0],
        revenue: result[0]?.total || 0,
        orders: result[0]?.count || 0
      };
    }));
    
    res.json(salesData);
  } catch (error) {
    next(error);
  }
};

// @desc  Get top selling products
// @route GET /api/dashboard/top-products
// @access Private
const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json(topProducts);
  } catch (error) {
    next(error);
  }
};

// @desc  Get recent orders
// @route GET /api/dashboard/recent-orders
// @access Private
const getRecentOrders = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const orders = await Order.find({ status: 'completed' })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber customerId total createdAt');
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getRecentOrders
};