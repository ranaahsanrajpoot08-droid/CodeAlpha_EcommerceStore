const db = require('../config/db');
const Order = require('../models/orderModel');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/stats  (admin)
exports.getStats = asyncHandler(async (req, res) => {
  const [[products]] = await db.query('SELECT COUNT(*) AS total FROM products');
  const [[users]] = await db.query('SELECT COUNT(*) AS total FROM users');
  const [[orders]] = await db.query('SELECT COUNT(*) AS total FROM orders');
  // Cancelled orders do not count as revenue
  const [[revenue]] = await db.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status <> 'Cancelled'");
  const recentOrders = (await Order.findAll()).slice(0, 5);

  res.json({
    stats: {
      totalProducts: products.total,
      totalUsers: users.total,
      totalOrders: orders.total,
      totalRevenue: Number(revenue.total),
    },
    recentOrders,
  });
});
