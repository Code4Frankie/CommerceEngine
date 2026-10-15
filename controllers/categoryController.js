// ShopCore API | controllers/categoryController.js
// Role: list categories (public) and create, update, delete them (admin).
// Owner: Ojelade Esther Omotoyosi (OJ2)
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, count: categories.length, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ name: req.body.name, description: req.body.description });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, description: req.body.description },
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) {
    throw new ApiError(400, 'This category still has products. Move or delete them first');
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category deleted' });
});
