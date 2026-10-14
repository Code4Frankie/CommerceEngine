import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Convert active shopping cart into a binding order & update store stock
 * @route   POST /api/v1/orders
 * @access  Private (Customer Only)
 */

export const createOrder = asyncHandler(async (req, res, next) => {
  // Extract required shipping parameters passed from the client frontend
  const { shippingAddress } = req.body;

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
    throw new ApiError(400, 'Complete shipping address parameters (fullName, phone, address, city) are mandatory.');
  }

  // Fetch user cart space containing populated product definitions
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your shopping cart is completely empty. Add items before placing an order.');
  }

  const orderItems = [];
  let orderTotal = 0;

  // Loop and map items using the structural naming parameters
  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      throw new ApiError(404, 'One or more products in your cart are no longer available in our store.');
    }

    // Stock check tracking against product.stock parameter
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Stock mismatch! "${product.name}" has only ${product.stock} units left, but you requested ${item.quantity}.`);
    }

    orderItems.push({
      product: product._id,
      name: product.name, // Synchronized to match model's inner layout tracking
      price: product.price,
      quantity: item.quantity
    });

    orderTotal += product.price * item.quantity;
  }

  // 3. Executing atomic inventory operations
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { stock: -item.quantity } },
      { runValidators: true }
    );
  }

  // 4. allocating customer checkout record mapping to the appropriate property fields
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress, // Appended required shipping variables 
    total: orderTotal, // Synchronized to map 'total' key field name
    status: 'pending' // Maps to the clean enum configuration
  });

  // 5. Reset client workspace environment items container
  cart.items = [];
  await cart.save();

  res.status(201).json({
    status: 'success',
    message: 'Order created successfully and inventory allocations locked down.',
    data: { order }
  });
});

/**
 * @desc    Fetch purchasing history portfolios for the logged-in client
 * @route   GET /api/v1/orders/my-orders
 * @access  Private (Customer Only)
 */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});
