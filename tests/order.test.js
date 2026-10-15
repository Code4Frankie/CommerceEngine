import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

let mongo, customer, otherCustomer, adminUser, product;
const tokenFor = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET);
const auth = (u) => ({ Authorization: `Bearer ${tokenFor(u)}` });

const address = {
  fullName: "Lionel Messi",
  address: "12 Allen Avenue",
  city: "Ikeja",
  state: "Lagos",
  country: "Nigeria",
  phone: "+2348012345678",
};

const fillCart = (user, quantity = 2) =>
  Cart.findOneAndUpdate(
    { user: user._id },
    { items: [{ product: product._id, quantity }] },
    { upsert: true, new: true }
  );

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([User, Product, Cart, Order].map((m) => m.deleteMany({})));
  [customer, otherCustomer, adminUser] = await User.create([
    { name: "Cust", email: "c@test.com", password: "Password1!", role: "customer" },
    { name: "Other", email: "o@test.com", password: "Password1!", role: "customer" },
    { name: "Admin", email: "a@test.com", password: "Password1!", role: "admin" },
  ]);
  product = await Product.create({
    name: "Sneakers",
    description: "Test sneakers",
    price: 5000,
    stock: 10,
    category: new mongoose.Types.ObjectId(),
  });
});

describe("POST /api/v1/orders", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).post("/api/v1/orders").send({ shippingAddress: address });
    expect(res.status).toBe(401);
  });

  it("validates the shipping address", async () => {
    await fillCart(customer);
    const res = await request(app)
      .post("/api/v1/orders")
      .set(auth(customer))
      .send({ shippingAddress: { ...address, city: "", phone: "abc" } });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(["shippingAddress.city", "shippingAddress.phone"])
    );
  });

  it("fails when the cart is empty", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set(auth(customer))
      .send({ shippingAddress: address });
    expect(res.status).toBe(400);
  });

  it("creates an order, computes totals server-side, reduces stock and clears the cart", async () => {
    await fillCart(customer, 2);
    const res = await request(app)
      .post("/api/v1/orders")
      .set(auth(customer))
      .send({ shippingAddress: address, total: 1 }); // client total must be ignored
    expect(res.status).toBe(201);
    expect(res.body.data.subtotal).toBe(10000);
    expect(res.body.data.total).toBe(10000 + res.body.data.shippingFee);
    expect(res.body.data.status).toBe("pending");

    expect((await Product.findById(product._id)).stock).toBe(8);
    expect((await Cart.findOne({ user: customer._id })).items).toHaveLength(0);
  });

  it("returns 409 and leaves stock untouched when stock is insufficient", async () => {
    await fillCart(customer, 99);
    const res = await request(app)
      .post("/api/v1/orders")
      .set(auth(customer))
      .send({ shippingAddress: address });
    expect(res.status).toBe(409);
    expect((await Product.findById(product._id)).stock).toBe(10);
    expect(await Order.countDocuments()).toBe(0);
  });
});

describe("GET orders", () => {
  let order;
  beforeEach(async () => {
    await fillCart(customer, 1);
    order = (
      await request(app).post("/api/v1/orders").set(auth(customer)).send({ shippingAddress: address })
    ).body.data;
  });

  it("lists only my orders", async () => {
    const mine = await request(app).get("/api/v1/orders/my").set(auth(customer));
    const theirs = await request(app).get("/api/v1/orders/my").set(auth(otherCustomer));
    expect(mine.body.data).toHaveLength(1);
    expect(theirs.body.data).toHaveLength(0);
  });

  it("lets the owner and admin view an order, but hides it from others", async () => {
    const url = `/api/v1/orders/${order._id}`;
    expect((await request(app).get(url).set(auth(customer))).status).toBe(200);
    expect((await request(app).get(url).set(auth(adminUser))).status).toBe(200);
    expect((await request(app).get(url).set(auth(otherCustomer))).status).toBe(404);
  });

  it("rejects an invalid id", async () => {
    const res = await request(app).get("/api/v1/orders/not-an-id").set(auth(customer));
    expect(res.status).toBe(400);
  });

  it("restricts the all-orders list to admins", async () => {
    expect((await request(app).get("/api/v1/orders").set(auth(customer))).status).toBe(403);
    const res = await request(app).get("/api/v1/orders?status=pending").set(auth(adminUser));
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe("cancel and status updates", () => {
  let order;
  beforeEach(async () => {
    await fillCart(customer, 3);
    order = (
      await request(app).post("/api/v1/orders").set(auth(customer)).send({ shippingAddress: address })
    ).body.data;
  });

  it("cancels a pending order and restores stock", async () => {
    const res = await request(app).patch(`/api/v1/orders/${order._id}/cancel`).set(auth(customer));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("cancelled");
    expect((await Product.findById(product._id)).stock).toBe(10);
  });

  it("does not let another user cancel my order", async () => {
    const res = await request(app).patch(`/api/v1/orders/${order._id}/cancel`).set(auth(otherCustomer));
    expect(res.status).toBe(404);
  });

  it("only lets admins change status", async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${order._id}/status`)
      .set(auth(customer))
      .send({ status: "processing" });
    expect(res.status).toBe(403);
  });

  it("follows the status flow and blocks invalid jumps", async () => {
    const set = (status) =>
      request(app).patch(`/api/v1/orders/${order._id}/status`).set(auth(adminUser)).send({ status });

    expect((await set("delivered")).status).toBe(400); // pending -> delivered not allowed
    expect((await set("processing")).status).toBe(200);
    expect((await set("shipped")).status).toBe(200);
    expect((await set("delivered")).status).toBe(200);
    expect((await set("cancelled")).status).toBe(400); // terminal state
  });

  it("customers cannot cancel once the order is processing", async () => {
    await request(app)
      .patch(`/api/v1/orders/${order._id}/status`)
      .set(auth(adminUser))
      .send({ status: "processing" });
    const res = await request(app).patch(`/api/v1/orders/${order._id}/cancel`).set(auth(customer));
    expect(res.status).toBe(400);
  });
});