// ShopCore API | middleware/upload.js
// Role: Multer. Reads image files from multipart forms into memory (max 5 files, 5 MB each, jpg/png/webp).
// Owner: Nge Chioma Rejoice (NG2)
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const allowed = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(), // nothing is written to disk
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new ApiError(400, 'Only jpg, png and webp images are allowed')),
});

export default upload;
