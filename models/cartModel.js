// ShopCore API | models/cartModel.js
// Role: Cart schema. One cart per user, holding product ids and quantities.
// Owner: Aziz Olaide Kafayat (AZ1)
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
