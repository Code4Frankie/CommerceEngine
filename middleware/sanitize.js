// ShopCore API | middleware/sanitize.js
// Role: removes keys that start with "$" or contain "." from the request body (blocks NoSQL injection).
// Owner: Abe Enoch (AB2)
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) delete value[key];
      else value[key] = clean(value[key]);
    }
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) clean(req.body);
  next();
};

export default sanitize;
