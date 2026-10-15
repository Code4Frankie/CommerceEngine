// ShopCore API | controllers/paymentController.js
// Role: starts a payment for an order, handles the gateway webhook, and a verify fallback.
// Owner: Stephanie Daniels (ST3)
import crypto from 'node:crypto';
import Order from '../models/orderModel.js';
import Payment from '../models/paymentModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { initializeTransaction, verifyTransaction, verifySignature } from '../services/paymentService.js';

// Marks a payment and its order as paid. Safe to call twice: only the first call changes anything.
const processSuccess = async (data) => {
  const payment = await Payment.findOne({ reference: data.reference });
  if (!payment || payment.status !== 'pending') return payment;
  if (data.amount !== Math.round(payment.amount * 100)) {
    console.error(`Payment ${data.reference}: amount mismatch (${data.amount} vs ${payment.amount * 100})`);
    return payment; // do not trust a payment whose amount does not match the order
  }
  const updated = await Payment.findOneAndUpdate(
    { _id: payment._id, status: 'pending' },
    { status: 'success', gatewayResponse: data },
    { new: true }
  );
  if (updated) await Order.updateOne({ _id: payment.order, status: 'pending' }, { status: 'paid' });
  return updated || payment;
};

export const initializePayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.status !== 'pending') throw new ApiError(400, `This order is already ${order.status}`);

  const reference = `SC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const data = await initializeTransaction({
    email: req.user.email,
    amount: order.total,
    reference,
    metadata: { orderId: order._id.toString() },
  });
  await Payment.create({ order: order._id, user: req.user._id, reference, amount: order.total });
  res.status(201).json({
    success: true,
    reference,
    authorizationUrl: data.authorization_url, // send the customer here to pay
  });
});

// The gateway calls this when a payment succeeds. The body arrives raw (see app.js).
export const paymentWebhook = asyncHandler(async (req, res) => {
  if (!verifySignature(req.body, req.headers['x-paystack-signature'])) return res.sendStatus(401);
  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.sendStatus(400);
  }
  if (event.event === 'charge.success') await processSuccess(event.data);
  return res.sendStatus(200); // always answer 200 quickly so the gateway stops retrying
});

// Fallback for when the webhook cannot reach the server (for example on localhost)
export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ reference: req.params.reference, user: req.user._id });
  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.status === 'pending') {
    const data = await verifyTransaction(payment.reference);
    if (data.status === 'success') await processSuccess(data);
  }
  const fresh = await Payment.findById(payment._id);
  res.json({ success: true, status: fresh.status });
});
