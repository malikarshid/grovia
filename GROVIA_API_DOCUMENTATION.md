# GROVIA: API Specification & Endpoint Documentation

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Base URL:** `http://localhost:3000` (Local) / `https://staging.grovia.in` (Staging)  
**Security:** JSON Web Tokens (Bearer Token in `Authorization` header or HTTP-only signed session cookie)  

---

## 1. Authentication & Session Endpoints

### 1.1 Customer Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "phone": "+91 98450 11223",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "user": { "id": "cuid...", "name": "Ananya Sharma", "email": "ananya@example.com", "role": "CUSTOMER" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 1.2 Customer Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  { "email": "ananya@example.com", "password": "SecurePassword123!" }
  ```
- **Response (200 OK):**
  ```json
  {
    "user": { "id": "cuid...", "name": "Ananya Sharma", "role": "CUSTOMER" },
    "token": "eyJhbGci..."
  }
  ```

### 1.3 Admin Login
- **Endpoint:** `POST /api/auth/admin-login`
- **Access:** Public (Admin Credentials required)
- **Request Body:**
  ```json
  { "loginId": "admin_me", "password": "your_secure_password" }
  ```
- **Response (200 OK):** Returns admin user profile and signed JWT with role `ADMIN` or `SUPER_ADMIN`.

### 1.4 Rider Login
- **Endpoint:** `POST /api/auth/rider-login`
- **Access:** Public (Rider Credentials required)
- **Request Body:**
  ```json
  { "loginId": "rider_me", "password": "your_secure_password" }
  ```
- **Response (200 OK):** Returns rider user profile, vehicle details, and signed JWT with role `RIDER`.

---

## 2. Customer Marketplace & Checkout Endpoints

### 2.1 Product Catalog Search
- **Endpoint:** `GET /api/products`
- **Access:** Public
- **Query Parameters:** `category` (slug), `search` (keyword), `limit`, `page`
- **Response (200 OK):** Array of product entities with pricing, images, discount badges, and stock availability.

### 2.2 Place Customer Order
- **Endpoint:** `POST /api/orders`
- **Access:** Authenticated Customer
- **Request Body:**
  ```json
  {
    "items": [{ "productId": "prod_1", "quantity": 2 }],
    "addressId": "addr_1",
    "paymentMethod": "COD"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "order": {
      "id": "ord_123",
      "orderNumber": "GRO-2026-9876",
      "subtotal": 450,
      "deliveryFee": 30,
      "total": 480,
      "orderStatus": "PENDING",
      "deliveryOtp": "4912"
    }
  }
  ```

---

## 3. Dedicated Rider Operations Endpoints

### 3.1 Availability & Shift Toggle
- **Endpoint:** `POST /api/rider/availability` / `GET /api/rider/availability`
- **Access:** Authenticated Rider
- **Request Body (POST):**
  ```json
  { "isOnline": true }
  ```
- **Response (200 OK):** Updates `RiderProfile.isOnline` and opens shift log in `RiderAvailability`. Rejects offline toggle if active delivery is in progress.

### 3.2 Update Delivery Status & OTP Verification
- **Endpoint:** `POST /api/rider/orders/[id]/status`
- **Access:** Authenticated Assigned Rider
- **Request Body:**
  ```json
  {
    "nextStatus": "DELIVERED",
    "otp": "4912",
    "latitude": 12.9784,
    "longitude": 77.6408
  }
  ```
- **Response (200 OK):** Verifies OTP matches `Order.deliveryOtp`. Generates `DeliveryProof` record and credits earnings.

### 3.3 Rider Earnings Breakdown
- **Endpoint:** `GET /api/rider/earnings`
- **Access:** Authenticated Rider
- **Response (200 OK):** Returns shift earnings, completed deliveries, tips, and settlement ledger.

---

## 4. Payment Gateway Endpoints

### 4.1 Create Razorpay Order
- **Endpoint:** `POST /api/payment/razorpay/order`
- **Access:** Authenticated Customer
- **Request Body:**
  ```json
  { "amount": 650.00, "receipt": "GRO-2026-101" }
  ```
- **Response (200 OK):** Returns Razorpay order object with amount in paise and order ID.

### 4.2 Verify Payment Signature
- **Endpoint:** `POST /api/payment/razorpay/verify`
- **Access:** Authenticated Customer
- **Request Body:**
  ```json
  {
    "razorpayOrderId": "order_xyz",
    "razorpayPaymentId": "pay_abc",
    "razorpaySignature": "hex_signature"
  }
  ```
- **Response (200 OK):** Verifies HMAC SHA-256 signature in constant time. Updates order status.

### 4.3 Webhook Handler
- **Endpoint:** `POST /api/payment/webhook`
- **Access:** Razorpay Servers (`x-razorpay-signature` validated)
- **Features:** Idempotent processing of `payment.captured`, `order.paid`, and `payment.failed`.

---

## 5. Location, Logistics & Health Diagnostics

### 5.1 Calculate Driving Distance
- **Endpoint:** `POST /api/location/distance`
- **Access:** Authenticated
- **Request Body:**
  ```json
  { "originLat": 12.9784, "originLng": 77.6408, "destLat": 12.9352, "destLng": 77.6245 }
  ```
- **Response (200 OK):** Returns driving distance and estimated minutes with provider (`GOOGLE_MAPS` or `HAVERSINE_SPHERICAL_FALLBACK`).

### 5.2 Courier Tracking Timeline
- **Endpoint:** `GET /api/logistics/track/[awb]`
- **Access:** Public
- **Response (200 OK):** Returns carrier name, shipment status, and chronological tracking checkpoints.

### 5.3 Health Check & Monitoring
- **Endpoint:** `GET /api/health`
- **Access:** Public
- **Response (200 OK):** Returns operational status, uptime, database latency, and service availability flags without leaking credentials.
