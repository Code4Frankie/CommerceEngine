import { body } from "express-validator";

const password = (field = "password") =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters");

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  password(),
];
export const loginRules = [
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
export const forgotPasswordRules = [
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
];
export const resetPasswordRules = [password()];
export const changePasswordRules = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  password("newPassword"),
];
