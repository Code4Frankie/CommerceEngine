// ShopCore API | controllers/orderController.js
// Role: turns the cart into an order (price snapshot, stock deduction), order history, and admin status updates.
// Owner: Anthony Edike (AN2, AN3)
import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/paginate.js';

// Which status changes the admin may make from each status
const NEXT = { pending: ['cancelled'], paid: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };

const restoreStock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const lines = (cart ? cart.items : []).filter((i) => i.product);
  if (!lines.length) throw new ApiError(400, 'Your cart is empty');

  // snapshot: copy name and price now, so later changes to the product do not change this order
  const items = lines.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    price: i.product.price,
    quantity: i.quantity,
  }));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // reserve stock one product at a time; the "stock >= quantity" condition stops overselling
  const reserved = [];
  let order;
  try {
    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount === 0) throw new ApiError(400, `Not enough stock for ${item.name}`);
      reserved.push(item);
    }
    order = await Order.create({ user: req.user._id, items, shippingAddress: req.body.shippingAddress, total });
  } catch (err) {
    await restoreStock(reserved); // undo any stock already taken
    throw err;
  }

  cart.items = [];
  await cart.save();
  res.status(201).json({ success: true, order });
});

export const myOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 10);
  const filter = { user: req.user._id };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, ...pageMeta(total, page, limit), orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');
  const ownerId = order.user._id.toString();
  if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) throw new ApiError(403, 'This is not your order');
  res.json({ success: true, order });
});

export const allOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20);
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, ...pageMeta(total, page, limit), orders });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  const { status } = req.body;
  if (!NEXT[order.status].includes(status)) {
    throw new ApiError(400, `An order that is ${order.status} cannot be changed to ${status}`);
  }
  if (status === 'cancelled') await restoreStock(order.items);
  order.status = status;
  await order.save();
  res.json({ success: true, order });
});

// A customer may cancel their own order only while it is still unpaid
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== 'pending') throw new ApiError(400, 'Only unpaid orders can be cancelled');
  await restoreStock(order.items);
  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, order });
});
