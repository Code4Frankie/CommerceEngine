// ShopCore API | models/paymentModel.js
// Role: Payment schema. One record per payment attempt, matched to the gateway by reference.
// Owner: Aziz Olaide Kafayat (AZ1)
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // in the main currency unit (for example naira)
    currency: { type: String, default: 'NGN' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    gatewayResponse: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
