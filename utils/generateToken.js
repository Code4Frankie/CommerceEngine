// ShopCore API | utils/generateToken.js
// Role: creates a signed login token (JWT) for a user id.
// Owner: Ogunsola Israel Oluwajomiloju (OG2)
import jwt from 'jsonwebtoken';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export default generateToken;
