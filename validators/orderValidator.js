import { body, param, query, validationResult } from "express-validator";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];


export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(400).json({
    status: "fail",
    message: "Validation failed",
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

const required = (field, label) =>
  body(`shippingAddress.${field}`).trim().notEmpty().withMessage(`${label} is required`);

export const createOrderRules = [
  body("shippingAddress").isObject().withMessage("shippingAddress is required"),
  required("fullName", "Full name"),
  required("address", "Address"),
  required("city", "City"),
  required("state", "State"),
  required("country", "Country"),
  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .bail()
    .matches(/^\+?[0-9\s-]{7,15}$/)
    .withMessage("Phone number is invalid"),
  body("shippingAddress.postalCode").optional({ values: "falsy" }).trim().isLength({ max: 12 }),
];

export const orderIdRules = [param("id").isMongoId().withMessage("Invalid order id")];

export const updateStatusRules = [
  ...orderIdRules,
  body("status")
    .isIn(STATUSES)
    .withMessage(`status must be one of: ${STATUSES.join(", ")}`),
];

export const listOrdersRules = [
  query("page").optional().isInt({ min: 1 }).toInt().withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("limit must be between 1 and 100"),
  query("status").optional().isIn(STATUSES).withMessage("Invalid status"),
  query("paymentStatus").optional().isIn(PAYMENT_STATUSES).withMessage("Invalid paymentStatus"),
  query("user").optional().isMongoId().withMessage("Invalid user id"),
];