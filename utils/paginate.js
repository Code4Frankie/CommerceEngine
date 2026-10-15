// ShopCore API | utils/paginate.js
// Role: reads page, limit, search, filter and sort from the URL query for list endpoints.
// Owner: Ojelade Esther Omotoyosi (OJ3)
import mongoose from 'mongoose';

// Only these sort values are accepted, so nobody can sort by arbitrary fields
const SORTS = ['price', '-price', 'createdAt', '-createdAt', 'name', '-name', 'ratingsAverage', '-ratingsAverage'];

export const parsePagination = (query, defaultLimit = 12) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const pageMeta = (total, page, limit) => ({ total, page, limit, pages: Math.ceil(total / limit) || 1 });

// ?search=bread&category=<id>&minPrice=500&maxPrice=5000&sort=-price&page=2&limit=10
export const parseProductQuery = (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.search) filter.$text = { $search: String(query.search) };
  if (query.category && mongoose.isValidObjectId(query.category)) filter.category = query.category;
  const min = Number(query.minPrice);
  const max = Number(query.maxPrice);
  if (query.minPrice !== undefined && !Number.isNaN(min)) filter.price = { ...filter.price, $gte: min };
  if (query.maxPrice !== undefined && !Number.isNaN(max)) filter.price = { ...filter.price, $lte: max };
  const sort = SORTS.includes(query.sort) ? query.sort : '-createdAt';
  return { filter, sort, page, limit, skip };
};
