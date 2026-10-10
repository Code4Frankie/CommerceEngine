import test from "node:test";
import assert from "node:assert/strict";

import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Review from "../models/reviewModel.js";

test("all seven Mongoose models load", () => {
  for (const model of [
    User,
    Product,
    Category,
    Cart,
    Order,
    Payment,
    Review,
  ]) {
    assert.ok(model.schema, `${model.modelName} should have a schema`);
  }
});

test("user requires name, email and password", async () => {
  const user = new User({});
  await assert.rejects(user.validate(), { name: "ValidationError" });
});

test("product rejects a negative price", async () => {
  const product = new Product({
    name: "Test product",
    slug: "test-product",
    description: "Test description",
    price: -1,
    category: "507f1f77bcf86cd799439011",
    stock: 1,
  });

  await assert.rejects(product.validate(), { name: "ValidationError" });
});

test("review rating must be between one and five", async () => {
  const review = new Review({
    user: "507f1f77bcf86cd799439011",
    product: "507f1f77bcf86cd799439012",
    rating: 6,
    comment: "Test review",
  });

  await assert.rejects(review.validate(), { name: "ValidationError" });
});
