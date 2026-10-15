# ShopCore API

**The core engine behind online commerce.**

ShopCore API is a backend for e-commerce platforms that serve **local businesses, products and services**. It gives small vendors and local shops one place to list what they sell, and gives buyers a simple way to browse, order and pay.

## Features

- Accounts and login with JWT, with customer, vendor and admin roles
- Categories and products, with search, filtering and pagination
- Image uploads to Cloudinary (Multer)
- Shopping cart and orders
- Online payments with a verified webhook
- Product reviews and ratings
- Admin tools for managing users, products and orders
- Security built in: Helmet, CORS, rate limiting, input sanitising and validation

## Tech Stack

Node.js · Express 5 · MongoDB (Mongoose) · Cloudinary and Multer · JWT · Postman · Render

## Getting Started

```bash
git clone https://github.com/Code4Frankie/CommerceEngine.git
cd CommerceEngine
npm install
cp .env.example .env     # then fill in your own values
npm run dev
```

Required in `.env`: `MONGO_URI` and `JWT_SECRET`. Everything else is listed in `.env.example`. **Never commit `.env`.**

Check it is running:

```bash
curl http://localhost:5000/api/v1/health
```

Use the port from your `.env` if you changed `PORT`.

## API Overview

Base path: `/api/v1`

| Area | Path |
| --- | --- |
| Health | `/health` |
| Auth and users | `/auth`, `/users` |
| Categories and products | `/categories`, `/products` |
| Cart and orders | `/cart`, `/orders` |
| Payments | `/payments` |
| Reviews | `/reviews` |
| Admin | `/admin` |

A ready-made Postman collection and environments are in the `postman/` folder.

## Project Structure

```
config/  controllers/  models/  routes/  middleware/
services/  validators/  utils/  scripts/  tests/  postman/
```

## Team Workflow

Branch from `develop`, open a pull request into `develop`, and merge `develop` into `main` after each day's work. Never push straight to `main`.

## Backend Team (Team E-commerce | local products and businesses)

| # | Member | Role |
| --- | --- | --- |
| 1 | Ahile Shagba Francis | Group Leader, Project Lead, Repo Owner. Project setup and infrastructure, app core and routes, final integration and wrap-up. |
| 2 | Aziz Olaide Kafayat | Assistant Lead, Database and QA, Docs and Deployment |
| 3 | Anthony Edike | Records, Orders |
| 4 | Ogunsola Israel Oluwajomiloju | Auth and Users |
| 5 | Ojelade Esther Omotoyosi | Products and Categories |
| 6 | Nge Chioma Rejoice | Media Uploads |
| 7 | Tunde Fadipe | Cart |
| 8 | Stephanie Daniels | Payments |
| 9 | Oyelekan Oluseye | Reviews and Admin |
| 10 | Abe Enoch | Security and Middleware |

## License

For learning and team project use. Add a license before public release.