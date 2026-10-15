// ShopCore API | config/cloudinary.js
// Role: configures the Cloudinary client from .env (images are stored there, not on Render's disk).
// Owner: Nge Chioma Rejoice (NG2)
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
