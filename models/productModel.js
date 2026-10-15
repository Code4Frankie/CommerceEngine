// ShopCore API | models/productModel.js
// Role: Product schema. Images live on Cloudinary; we keep the url and publicId.
// Owner: Aziz Olaide Kafayat (AZ1)
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'] },
    images: [{ url: String, publicId: String }],
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' }); // powers ?search=
productSchema.index({ category: 1, price: 1 });

export default mongoose.model('Product', productSchema);
