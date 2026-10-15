
// Role: talks to the payment gateway (Paystack) and checks webhook signatures.
//  Stephanie Daniels (ST2, ST3)
import crypto from 'node:crypto';
import { paymentConfig } from '../config/payment.js';
import ApiError from '../utils/ApiError.js';

// Small helper: calls the gateway and returns its "data" part
const callGateway = async (path, options = {}) => {
  if (!paymentConfig.secretKey) throw new ApiError(500, 'Payment gateway is not configured');
  const res = await fetch(`${paymentConfig.baseUrl}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${paymentConfig.secretKey}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.status === false) throw new ApiError(502, body.message || 'Payment gateway error');
  return body.data;
};

// amount is in naira; Paystack wants kobo (x 100)
export const initializeTransaction = ({ email, amount, reference, metadata }) =>
  callGateway('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      reference,
      currency: paymentConfig.currency,
      callback_url: paymentConfig.callbackUrl,
      metadata,
    }),
  });

export const verifyTransaction = (reference) => callGateway(`/transaction/verify/${encodeURIComponent(reference)}`);

// Paystack signs the raw webhook body with HMAC SHA512 using the secret key
export const verifySignature = (rawBody, signature) => {
  if (!signature || !paymentConfig.secretKey) return false;
  const expected = crypto.createHmac('sha512', paymentConfig.secretKey).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
