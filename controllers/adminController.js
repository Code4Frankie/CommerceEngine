// ShopCore API | controllers/adminController.js
// Role: admin tools: list and delete users, and sales statistics.
// Owner: Oyelekan Oluseye (OY2, OY3)
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/paginate.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20);
  const [users, total] = await Promise.all([
    User.find().sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ success: true, ...pageMeta(total, page, limit), users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'You cannot delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, message: 'User deleted' });
});

export const salesStats = asyncHandler(async (req, res) => {
  const [sales] = await Order.aggregate([
    { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
    { $group: { _id: null, totalSales: { $sum: '$total' }, paidOrders: { $sum: 1 } } },
  ]);
  const byStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const [users, products] = await Promise.all([User.countDocuments(), Product.countDocuments()]);
  res.json({
    success: true,
    stats: {
      totalSales: sales ? sales.totalSales : 0,
      paidOrders: sales ? sales.paidOrders : 0,
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      users,
      products,
    },
  });
});
