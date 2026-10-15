// ShopCore API | controllers/productController.js
// Role: browse products (public) with search, filter, sort and pagination; admin create, update, delete with images.
// Owner: Ojelade Esther Omotoyosi (OJ2, OJ3) | image upload: Nge Chioma Rejoice (NG3)
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parseProductQuery, pageMeta } from '../utils/paginate.js';
import { uploadBuffer, deleteImage } from '../utils/cloudinaryUpload.js';

const FIELDS = ['name', 'description', 'price', 'stock', 'category'];
// copy only the fields we allow from the request body
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

export const listProducts = asyncHandler(async (req, res) => {
  const { filter, sort, page, limit, skip } = parseProductQuery(req.query);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name').sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, ...pageMeta(total, page, limit), count: products.length, products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  if (!(await Category.exists({ _id: req.body.category }))) throw new ApiError(400, 'Category does not exist');
  const images = await Promise.all((req.files || []).map((file) => uploadBuffer(file.buffer)));
  const product = await Product.create({ ...pick(req.body), images });
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (req.body.category && !(await Category.exists({ _id: req.body.category }))) {
    throw new ApiError(400, 'Category does not exist');
  }
  if (req.files && req.files.length) {
    // new images replace the old ones, and the old ones are removed from Cloudinary
    await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
    product.images = await Promise.all(req.files.map((file) => uploadBuffer(file.buffer)));
  }
  Object.assign(product, pick(req.body));
  await product.save();
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});
