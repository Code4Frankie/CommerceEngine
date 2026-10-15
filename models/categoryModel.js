// ShopCore API | models/categoryModel.js
// Role: Category schema (for example Food, Fashion, Crafts).
// Owner: Aziz Olaide Kafayat (AZ1)
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
