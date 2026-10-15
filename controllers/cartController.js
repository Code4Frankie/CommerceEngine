// ShopCore API | controllers/cartController.js
// Role: the logged-in user's cart: view, add, change quantity, remove, clear. Checks stock.
// Owner: Tunde Fadipe (TU3)
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Shapes the cart for the response: skips deleted products and adds subtotals and a total
const present = (cart) => {
  const items = (cart ? cart.items : [])
    .filter((i) => i.product)
    .map((i) => ({ product: i.product, quantity: i.quantity, subtotal: i.product.price * i.quantity }));
  return { items, total: items.reduce((sum, i) => sum + i.subtotal, 0) };
};

const loadCart = (userId) => Cart.findOne({ user: userId }).populate('items.product', 'name price stock images');

const checkStock = (product, quantity) => {
  if (quantity > product.stock) throw new ApiError(400, `Only ${product.stock} of ${product.name} in stock`);
};

export const getCart = asyncHandler(async (req, res) => {
  res.json({ success: true, cart: present(await loadCart(req.user._id)) });
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  const cart = (await Cart.findOne({ user: req.user._id })) || new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find((i) => i.product.toString() === productId);
  const newQuantity = (existing ? existing.quantity : 0) + quantity;
  checkStock(product, newQuantity);
  if (existing) existing.quantity = newQuantity;
  else cart.items.push({ product: productId, quantity });
  await cart.save();
  res.json({ success: true, cart: present(await loadCart(req.user._id)) });
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart && cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, 'Item is not in your cart');
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, 'Product no longer exists');
  checkStock(product, req.body.quantity);
  item.quantity = req.body.quantity;
  await cart.save();
  res.json({ success: true, cart: present(await loadCart(req.user._id)) });
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
  }
  res.json({ success: true, cart: present(await loadCart(req.user._id)) });
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { items: [] });
  res.json({ success: true, cart: { items: [], total: 0 } });
});
