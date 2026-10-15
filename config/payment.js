// ShopCore API | config/payment.js
// Role: payment gateway settings (written for Paystack; change the URLs if another gateway is chosen).
// Owner: Stephanie Daniels (ST2)
export const paymentConfig = {
  secretKey: process.env.PAYMENT_SECRET_KEY,
  baseUrl: process.env.PAYMENT_BASE_URL || 'https://api.paystack.co',
  currency: process.env.PAYMENT_CURRENCY || 'NGN',
  callbackUrl: process.env.PAYMENT_CALLBACK_URL || undefined, // where the customer returns after paying
};
