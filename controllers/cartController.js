import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js'; 
import ApiError from '../utils/ApiError.js';       
import asyncHandler  from '../utils/asyncHandler.js';  

/**
 * @desc    Fetch active customer shopping cart profiles
 * @route   GET /api/v1/cart
 * @access  Private (Customer Only)
 */
export const getCart = asyncHandler(async (req, res, next) => {
  // Grab the user cart and populate fields directly matching the team's model: name, price, stock
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price stock');
  
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

/**
 * @desc    Add an inventory product line item to the shopping cart container
 * @route   POST /api/v1/cart
 * @access  Private (Customer Only)
 */
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const targetQuantity = parseInt(quantity, 10) || 1;

  // Make sure the target item exists in the team's data catalogue
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'The requested product could not be found.');

  // Verify if the team's 'stock' field can support the raw quantity allocation
  if (product.stock < targetQuantity) {
    throw new ApiError(400, `Insufficient inventory headroom. Only ${product.stock} items left in stock.`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // If it's already in the cart, increment it instead of creating a new item
  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

  if (itemIndex > -1) {
    const totalAccumulatedQuantity = cart.items[itemIndex].quantity + targetQuantity;
    
    // Cross-verify the cumulative total against the team's 'stock' limit
    if (product.stock < totalAccumulatedQuantity) {
      throw new ApiError(400, `Cannot update. Combined cart items exceed total available store stock of ${product.stock}.`);
    }
    cart.items[itemIndex].quantity = totalAccumulatedQuantity;
  } else {
    // Drop a fresh item descriptor into the array tracking sequence
    cart.items.push({ product: productId, quantity: targetQuantity });
  }

  await cart.save();
  res.status(200).json({
    status: 'success',
    message: 'Product successfully added to your cart.',
    data: { cart }
  });
});

/**
 * @desc    Calibrate accurate product quantities directly inside your cart metrics
 * @route   PUT /api/v1/cart/:productId
 * @access  Private (Customer Only)
 */
export const updateCartQuantity = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const newQuantity = parseInt(quantity, 10);

  if (newQuantity < 1) throw new ApiError(400, 'Item quantity adjustments must register at least 1 unit.');

  // Cross-reference request bounds against team's 'stock' field tracking parameters
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product target data references do not match existing data fields.');
  
  if (product.stock < newQuantity) {
    throw new ApiError(400, `Request blocked. Only ${product.stock} units are available.`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Active shopping cart tracking file record missing.');

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex === -1) throw new ApiError(404, 'This product is not inside your cart.');

  cart.items[itemIndex].quantity = newQuantity;
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Cart quantities adjusted smoothly.',
    data: { cart }
  });
});

/**
 * @desc    Remove an item completely from the shopping cart portfolio
 * @route   DELETE /api/v1/cart/:productId
 * @access  Private (Customer Only)
 */
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Active shopping cart session not found.');

  const itemExists = cart.items.some(item => item.product.toString() === productId);
  if (!itemExists) throw new ApiError(404, 'This product is not inside your cart.');

  // Filter out the selected product index node cleanly from the document matrix
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Item removed from your cart.',
    data: { cart }
  });
});

/**
 * @desc    Clear all items inside the shopping cart container
 * @route   DELETE /api/v1/cart
 * @access  Private (Customer Only)
 */
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Active shopping cart tracking session missing.');

  cart.items = [];
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Shopping cart wiped clean.',
    data: { cart }
  });
});
