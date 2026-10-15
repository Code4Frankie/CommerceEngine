// ShopCore API | controllers/reviewController.js
// Role: customers review products they bought; keeps the product's average rating up to date.
// Owner: Oyelekan Oluseye (OY3)
import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/paginate.js';

const refreshRating = async (productId) => {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats ? Math.round(stats.average * 10) / 10 : 0,
    ratingsCount: stats ? stats.count : 0,
  });
};

export const addReview = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  if (!(await Product.exists({ _id: productId }))) throw new ApiError(404, 'Product not found');
  // only people who paid for the product may review it
  const bought = await Order.exists({
    user: req.user._id,
    status: { $in: ['paid', 'shipped', 'delivered'] },
    'items.product': productId,
  });
  if (!bought) throw new ApiError(403, 'You can only review products you have bought');
  const review = await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    { rating: req.body.rating, comment: req.body.comment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true } // one review per user: update if it exists
  );
  await refreshRating(productId);
  res.status(201).json({ success: true, review });
});

export const listReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 10);
  const filter = { product: req.params.id };
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('user', 'name').sort('-createdAt').skip(skip).limit(limit),
    Review.countDocuments(filter),
  ]);
  res.json({ success: true, ...pageMeta(total, page, limit), reviews });
});
s