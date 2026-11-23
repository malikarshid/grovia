# GROVIA: Security Architecture & Vulnerability Review

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Review Type:** Pre-Staging Security & Compliance Audit  
**Review Date:** November 23, 2026  
**Auditor:** Senior DevOps & Application Security Engineer  

---

## 1. Executive Security Summary

GROVIA implements defence-in-depth security across authentication, authorization, session management, database interactions, external integrations, and edge network routing.

| Security Domain | Status | Key Mechanism / Implementation |
|---|---|---|
| **Authentication & Password Hashing** | **VERIFIED** | bcrypt (salt rounds 10), constant-time comparisons |
| **Role-Based Access Control (RBAC)** | **VERIFIED** | Strict role boundaries (`CUSTOMER`, `RIDER`, `ADMIN`, `SUPER_ADMIN`) |
| **Edge Route Protection** | **VERIFIED** | Next.js Edge Middleware guarding `/admin/*`, `/rider/*`, and sensitive APIs |
| **Session & Cookie Security** | **VERIFIED** | Signed JWTs, `HttpOnly`, `SameSite=Lax`, `Secure` in production |
| **Brute Force & Rate Limiting** | **VERIFIED** | Account lockout windows, failed attempt tracking in `User` model |
| **Delivery OTP Handshake** | **VERIFIED** | 4-digit cryptographically random OTP, single-use, strict validation |
| **Webhook Signature Verification** | **VERIFIED** | HMAC SHA-256 with byte-length guarded `crypto.timingSafeEqual` |
| **SQL Injection Prevention** | **VERIFIED** | 100% Parameterized queries via Prisma ORM |
| **Cross-Site Scripting (XSS)** | **VERIFIED** | React auto-escaping, sanitized props, zero `dangerouslySetInnerHTML` |
| **Sensitive Data Exposure** | **VERIFIED** | Zero secrets in Git; `/api/health` sanitized; no passwords in JSON |
| **HTTP Security Headers** | **IMPLEMENTED** | CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |

---

## 2. In-Depth Security Verification

### 2.1 Password Hashing & Storage
- **Algorithm:** `bcryptjs` with salt work factor of 10.
- **Validation:** Passwords are never stored in plain text. Model stores exclusively `passwordHash`.
- **Policy Enforcement:** Minimum 8 characters, requiring at least one number and special character on customer registration and password change.
- **Verification Evidence:** `tests/unit/auth.test.ts` and `tests/e2e/workflow_audit.test.ts` confirm hashed storage and password verification.

### 2.2 Role-Based Access Control & Route Guarding
GROVIA defines four explicit roles:
1. `CUSTOMER`: Can access personal profile, addresses, cart, orders, and public catalog.
2. `RIDER`: Can access `/rider/*`, availability toggling, assigned deliveries, and earnings.
3. `ADMIN`: Can access `/admin/*` operations, inventory, catalog, and order assignment.
4. `SUPER_ADMIN`: Root privileges, audit log review, role permission modifications.

- **Edge Middleware Enforcement (`src/middleware.ts`):**
  - Intercepts requests before reaching application page handlers.
  - Inspects JWT session token.
  - Redirects unauthenticated requests to role-specific login screens (`/auth/login`, `/admin/login`, `/rider/login`).
  - Returns `403 Forbidden` if a valid customer token attempts to hit `/admin/*` or `/api/admin/*`.
- **Verification Evidence:** `tests/integration/auth_rbac_riders.test.ts` confirms that cross-role access is denied.

### 2.3 Delivery Handshake & OTP Verification
- **Challenge:** Preventing fraudulent mark-as-delivered updates by riders.
- **Mechanism:**
  - Upon order creation, a cryptographically random 4-digit numeric code is generated (`Order.deliveryOtp`).
  - The OTP is accessible exclusively to the ordering customer in their tracking dashboard (`/order-tracking/[id]`).
  - Riders cannot view the OTP in their dashboard.
  - At the doorstep, the rider must obtain the OTP from the customer and submit it via `/api/rider/orders/[id]/status`.
  - The API verifies `String(inputOtp).trim() === String(expectedOtp).trim()`.
  - Upon success, the delivery status is set to `DELIVERED`, a `DeliveryProof` record is generated with `otpVerified: true`, GPS coordinates are recorded, and rider earnings are credited.
- **Verification Evidence:** `tests/integration/rider_portal_complete.test.ts` verifies OTP rejection on invalid codes and successful completion on match.

### 2.4 Razorpay Webhook & Signature Security
- **Algorithm:** `crypto.createHmac('sha256', secret).update(rawPayload).digest('hex')`.
- **Timing Attack Mitigation:**
  ```typescript
  const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
  const actualBuf = Buffer.from(signature, 'utf-8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
  ```
- **Duplicate Webhook Idempotency:**
  - Uses `prisma.payment.upsert` matching on the `@unique` field `transactionId: paymentEntity.id`.
  - If a webhook retry arrives from Razorpay, the transaction is updated idempotently without duplicating payment rows or creating order state conflicts.
- **Verification Evidence:** `tests/integration/services_and_health.test.ts` verifies valid signature pass, tampered signature failure, and duplicate webhook idempotency.

### 2.5 API Health & Data Exposure Audit
- **Endpoint:** `GET /api/health`
- **Output Audit:**
  - Returns: System status, uptime, database latency in milliseconds, user count, product count, and subsystem operational flags.
  - **Does NOT Return:** Database hostnames, connection strings, usernames, passwords, API tokens, stack traces, or customer personal information.

---

## 3. Security Recommendations for Staging Deployment

1. **Secret Rotation:** Generate unique 64-character cryptographic tokens for `JWT_SECRET` and `NEXTAUTH_SECRET` in staging.
2. **Database SSL:** Ensure `sslmode=require` is appended to `POSTGRESQL_URL`.
3. **CORS & Origin Locking:** In staging reverse proxy (e.g. Nginx or Cloudflare), restrict `Access-Control-Allow-Origin` strictly to `https://staging.grovia.in`.
4. **WAF Rule Enforcement:** Enable Cloudflare OWASP Core Ruleset to protect against automated scrapers and layer-7 DDoS.
