// ShopCore API | tests/product.test.js
// Role: tests categories and products: admin-only writes, browsing, search, cart stock and ordering.
// Owner: Ojelade Esther Omotoyosi (OJ4)
import './env.js';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, stopServer } from './setup.js';
import { api, registerUser, createAdmin } from './helpers.js';

let admin;
let customer;
let categoryId;
let productId;

before(async () => {
  await startServer();
  admin = await createAdmin();
  customer = await registerUser();
});
after(stopServer);

test('customers cannot create categories', async () => {
  const res = await api('POST', '/categories', { token: customer.token, body: { name: 'Nope' } });
  assert.equal(res.status, 403);
});

test('admin creates a category and a product', async () => {
  const cat = await api('POST', '/categories', { token: admin.token, body: { name: 'Food and Groceries' } });
  assert.equal(cat.status, 201);
  categoryId = cat.body.category._id;
  const prod = await api('POST', '/products', {
    token: admin.token,
    body: { name: 'Fresh Bread', description: 'Baked this morning', price: 1500, stock: 5, category: categoryId },
  });
  assert.equal(prod.status, 201);
  productId = prod.body.product._id;
});

test('products can be listed and searched by anyone', async () => {
  const list = await api('GET', '/products');
  assert.equal(list.status, 200);
  assert.equal(list.body.total, 1);
  const search = await api('GET', '/products?search=bread');
  assert.equal(search.body.count, 1);
  const miss = await api('GET', '/products?search=zzzzzz');
  assert.equal(miss.body.count, 0);
});

test('cart refuses more than the stock', async () => {
  const res = await api('POST', '/cart/items', { token: customer.token, body: { productId, quantity: 99 } });
  assert.equal(res.status, 400);
});

test('an order deducts stock and empties the cart', async () => {
  await api('POST', '/cart/items', { token: customer.token, body: { productId, quantity: 2 } });
  const order = await api('POST', '/orders', {
    token: customer.token,
    body: { shippingAddress: { fullName: 'Test User', phone: '08012345678', address: '12 Market Road', city: 'Lagos' } },
  });
  assert.equal(order.status, 201);
  assert.equal(order.body.order.total, 3000);
  const product = await api('GET', `/products/${productId}`);
  assert.equal(product.body.product.stock, 3);
  const cart = await api('GET', '/cart', { token: customer.token });
  assert.equal(cart.body.cart.items.length, 0);
});
