import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: { type: String, required: true, trim: true },
    reference: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN", uppercase: true },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paidAt: Date,
    providerTransactionId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
