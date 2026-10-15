### Orders

Orders are created from the logged-in user's cart. Prices and totals are always calculated on the server from current product data, and stock is reserved when an order is placed.

All order endpoints require a JWT: `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/orders` | User | Create an order from the cart |
| GET | `/api/v1/orders/my` | User | List my orders (`page`, `limit`, `status`) |
| GET | `/api/v1/orders/:id` | Owner / Admin | Get one order |
| PATCH | `/api/v1/orders/:id/cancel` | Owner / Admin | Cancel an order and restore stock |
| GET | `/api/v1/orders` | Admin | List all orders (`page`, `limit`, `status`, `paymentStatus`, `user`) |
| PATCH | `/api/v1/orders/:id/status` | Admin | Update order status |

### Create order

`POST /api/v1/orders`

```json
{
  "shippingAddress": {
    "fullName": "Lionel Messi",
    "address": "12 Allen Avenue",
    "city": "Ikeja",
    "state": "Lagos",
    "postalCode": "100271",
    "country": "Nigeria",
    "phone": "+2348012345678"
  }
}
```

- `201` order created, cart cleared, stock reduced
- `400` empty cart or validation error
- `409` insufficient stock (nothing is changed)

### Status flow

```
pending -> processing -> shipped -> delivered
   \            \
    +------------+--> cancelled
```

- Customers can cancel only while the order is `pending`.
- Admins can cancel while `pending` or `processing`.
- Cancelling restores product stock.
- `delivered` and `cancelled` are final.

### Config

| Variable | Default | Description |
|----------|---------|-------------|
| `SHIPPING_FEE` | `0` | Flat shipping fee added to every order (NGN) |

### Running the order tests

```bash
npm i -D jest supertest mongodb-memory-server
NODE_OPTIONS=--experimental-vm-modules npx jest tests/order.test.js
```