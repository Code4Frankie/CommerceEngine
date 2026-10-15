import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  validate,
  createOrderRules,
  orderIdRules,
  updateStatusRules,
  listOrdersRules,
} from "../validators/orderValidator.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Customer
router.post("/", protect, createOrderRules, validate, createOrder);
router.get("/my", protect, listOrdersRules, validate, getMyOrders);

// Admin: static paths must come before "/:id")
router.get("/", protect, restrictTo("admin"), listOrdersRules, validate, getAllOrders);

// Owner or admin 
router.get("/:id", protect, orderIdRules, validate, getOrderById);
router.patch("/:id/cancel", protect, orderIdRules, validate, cancelOrder);

// Admin
router.patch(
  "/:id/status",
  protect,
  restrictTo("admin"),
  updateStatusRules,
  validate,
  updateOrderStatus
);

export default router;
