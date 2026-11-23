# GROVIA: PAYMENT GATEWAY ARCHITECTURE & RAZORPAY INTEGRATION
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Service Implementation:** [`src/services/paymentService.ts`](src/services/paymentService.ts)  
**API Endpoints:**
- `POST /api/payment/razorpay/order` — Server-side order generation
- `POST /api/payment/razorpay/verify` — Cryptographic signature verification
- `POST /api/payment/webhook` — Asynchronous webhook processing

---

## 1. Executive Summary & Integration Status

GROVIA features a dual-layer payment architecture:
1. **Live Gateway Layer (Razorpay):** Direct server-side integration for Indian cards, UPI (Google Pay, PhonePe, Paytm, BHIM), netbanking, and wallets with HMAC-SHA256 signature verification.
2. **Safe Development / Demo Standby Layer:** Zero-dependency testing engine providing realistic mock order tokens and immediate checkout testing without risking real money or triggering false gateway errors.
3. **Cash on Delivery (COD):** Integrated order workflow with physical OTP collection at doorstep.

### Integration Status Matrix

| Component | Status | Verification Evidence |
|---|:---:|---|
| **Server-Side Order Generation** | **COMPLETE** | `PaymentService.createRazorpayOrder` produces valid amounts in paise with receipt tracking |
| **Payment Signature Verification** | **COMPLETE** | Timing-safe HMAC SHA-256 verification against `RAZORPAY_KEY_SECRET` |
| **Webhook Signature Verification** | **COMPLETE** | Verifies `x-razorpay-signature` on incoming webhooks with idempotency |
| **Order & Payment Persistence** | **COMPLETE** | Atomic database transaction updating `Order.paymentStatus` and creating `Payment` entity |
| **Live Production Gateway** | **BLOCKED** | Standby mode active until live merchant keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are configured |

---

## 2. Security Architecture & Rules

- **Zero Secret Exposure:** `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are strictly server-side environment variables and are never exposed to browser bundles or `NEXT_PUBLIC_*` flags.
- **Never Trust Client Callbacks Alone:** Orders are never marked as `PAID` merely based on a frontend callback. The backend receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` and verifies the mathematical HMAC hash before updating database records.
- **Timing-Safe Equality:** Signature comparisons use `crypto.timingSafeEqual` to eliminate timing-attack vulnerabilities.
- **Idempotency Protection:** Duplicate webhook calls or double-submission of the verification endpoint will not record duplicate payments or double-increment customer balances.

---

## 3. Environment Variables Configuration

Add the following keys to your production `.env`:

```env
# Razorpay Merchant Credentials
RAZORPAY_KEY_ID="rzp_live_your_actual_key_here"
RAZORPAY_KEY_SECRET="your_actual_live_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_actual_webhook_secret_here"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_your_actual_key_here"

# Operational Mode: Set to "LIVE" for real transactions, or "DEMO" for testing
PAYMENT_MODE="LIVE"
```

---

## 4. Webhook Event Handling

The webhook listener (`/api/payment/webhook`) processes the following standard Razorpay events:
- `order.paid`: Confirms order payment asynchronously.
- `payment.captured`: Updates internal transaction record to `SUCCESS`.
- `payment.failed`: Records failed payment attempt with error description.
