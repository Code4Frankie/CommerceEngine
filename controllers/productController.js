
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { paginate, paginationMeta } from "../utils/paginate.js";

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};

    if (req.query.category) {
      if (!mongoose.isValidObjectId(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
      filter.category = req.query.category;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    if (req.query.price_min !== undefined || req.query.price_max !== undefined) {
      filter.price = {};
      if (req.query.price_min !== undefined) {
        const min = Number(req.query.price_min);
        if (!Number.isFinite(min) || min < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minimum price",
          });
        }
        filter.price.$gte = min;
      }
      if (req.query.price_max !== undefined) {
        const max = Number(req.query.price_max);
        if (!Number.isFinite(max) || max < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maximum price",
          });
        }
        filter.price.$lte = max;
      }
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.productId)
      .populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
return res.status(500).json({
            message: error.message
        }) 
     }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name, slug, description, price, category,
      images, stock, sku, isActive,
    } = req.body;

    if (!name || !slug || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, description, price and category are required",
      });
    }

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const categoryExists = await Category.exists({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found or inactive",
      });
    }

    const product = await Product.create({
      name, slug, description, price, category,
      ...(images !== undefined && { images }),
      ...(stock !== undefined && { stock }),
      ...(sku !== undefined && { sku }),
      ...(isActive !== undefined && { isActive }),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with that unique value already exists",
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const allowedFields = [
      "name", "slug", "description", "price", "category",
      "images", "stock", "sku", "isActive",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.category !== undefined) {
      if (!mongoose.isValidObjectId(updates.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.exists({
        _id: updates.category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found or inactive",
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with that unique value already exists",
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};