import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'A cart item must be linked to a valid product item.']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is mandatory.'],
    min: [1, 'Quantity cannot drop below 1 unit.']
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A cart must belong to an active user.'],
    unique: true // each customer gets exactly one unique cart tracking
  },
  items: [cartItemSchema]
}, { 
  timestamps: true // Tracks exactly when the cart was modified
});

const Cart = mongoose.model('Cart', cartSchema);


export default Cart;
