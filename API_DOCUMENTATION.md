# GROVIA API Documentation

All API endpoints return JSON responses with standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a customer account.
- **Request Body:** `{ name, email, phone, password }`
- **Response:** Sets HTTP-only `grovia_session` cookie; returns `{ user }`.

### `POST /api/auth/login`
Authenticates a customer or staff administrator.
- **Request Body:** `{ email, password }`
- **Response:** Sets HTTP-only `grovia_session` cookie; returns `{ user, message }`.

### `POST /api/auth/logout`
Clears user session.
- **Response:** Deletes cookie; returns `{ message }`.

### `GET /api/auth/me`
Fetches current authenticated session and profile.

---

## 2. Products (`/api/products`)

### `GET /api/products`
Retrieves products with query filters.
- **Query Params:**
  - `search`: text query across name, description, SKU.
  - `category`: category slug.
  - `sort`: `newest`, `price-low-high`, `price-high-low`, `popularity`, `rating`.
  - `featured`: boolean.
  - `bestSeller`: boolean.
  - `page`: integer.
  - `limit`: integer.

### `GET /api/products/[id]`
Retrieves product details and related category products. Accepts ID or slug.

### `POST /api/products` (Staff Required)
Creates a new product and creates linked initial inventory record.

### `PATCH /api/products/[id]` (Staff Required)
Updates product attributes, price, or stock levels.

### `DELETE /api/products/[id]` (Staff Required)
Archives a product safely without breaking historical order integrity.

---

## 3. Categories (`/api/categories`)

### `GET /api/categories`
Returns all active grocery categories with product count badges.

### `POST /api/categories` (Staff Required)
Creates a new category.

### `PATCH /api/categories/[id]` (Staff Required)
Updates category information.

### `DELETE /api/categories/[id]` (Staff Required)
Deletes category if no products are assigned.

---

## 4. Orders & Checkout (`/api/orders`)

### `GET /api/orders`
- For Customers: returns user's order history.
- For Staff: returns all customer orders with status and search filters.

### `POST /api/orders`
Transactional multi-step order placement.
- **Request Body:**
  ```json
  {
    "items": [{ "productId": "...", "quantity": 2 }],
    "addressId": "...",
    "deliverySlotId": "...",
    "paymentMethod": "DEMO",
    "couponCode": "GROVIA100"
  }
  ```
- **Execution:** Validates stock, recalculates subtotal, coupon discount, delivery fee, 5% GST; decrements stock; creates order items; logs payment; registers tracking number.

### `PATCH /api/orders/[id]` (Staff Required)
Updates order status (`CONFIRMED`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).

---

## 5. Inventory & Deliveries

### `GET /api/inventory`
Live inventory levels with stock alerts.

### `POST /api/inventory/adjustments`
Performs stock increment, reduction, or exact adjustments with audit reason.

### `GET /api/deliveries`
Returns delivery fleet tracking records.

### `PATCH /api/deliveries/[id]`
Updates delivery partner assignment and status.

---

## 6. Promotions (`/api/coupons`)

### `GET /api/coupons`
Returns available coupon records.

### `POST /api/coupons/validate`
Validates coupon against minimum order amount, expiry, and usage limits.
