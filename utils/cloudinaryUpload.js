// ShopCore API | utils/cloudinaryUpload.js
// Role: sends an image held in memory (from Multer) to Cloudinary, and deletes images.
// Owner: Nge Chioma Rejoice (NG2)
import cloudinary from '../config/cloudinary.js';

export const uploadBuffer = (buffer, folder = 'shopcore/products') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) =>
      err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    stream.end(buffer);
  });

export const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);
