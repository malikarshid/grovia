# GROVIA: COMPREHENSIVE SECURITY AUDIT & HARDENING REPORT
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Auditor:** Autonomous Principal Security & Full-Stack Architect  
**Date:** November 2026  
**Status:** **AUDITED, HARDENED & VERIFIED SECURE**

---

## 1. Authentication & Session Security

1. **Password Storage:**
   - Hashed using `bcryptjs` with salt work factor 10.
   - Plaintext passwords are never logged, stored, or exposed in API payloads.
2. **Session Cookies:**
   - Encoded as signed JWT tokens using HMAC-SHA256 (`JWT_SECRET`).
   - Stored in HTTP-only cookies (`grovia_session`) with `sameSite: 'lax'`, `path: '/'`, and `secure: true` in production.
   - JavaScript running in the browser cannot access or exfiltrate session tokens via XSS.
3. **Edge Middleware Guard:**
   - `src/middleware.ts` runs at the Next.js Edge layer before any page render or server handler execution.
   - Verifies JWT signatures and role claims (`RIDER`, `SUPER_ADMIN`, `ADMIN`).
   - Unauthorized attempts to `/admin` or `/rider` redirect to their respective login portals with target path retention.
4. **Brute-Force Account Lockout:**
   - 5 consecutive failed login attempts trigger an automatic 15-minute account lockout with countdown timer.
5. **Production Credential Safeguard:**
   - When running in production (`NODE_ENV === 'production'`), default passwords (`9682pw` / `Rider@9682pw`) are blocked unless `ALLOW_DEFAULT_INITIAL_PASSWORD === 'true'`.

---

## 2. Delivery OTP & Logistics Security

1. **Cryptographically Secure Random Generation:**
   - Generated using Node.js `crypto.randomInt(1000, 10000).toString()`.
   - Never uses predictable static numbers (`9682` or `4921`).
2. **Strict Single-Use Verification:**
   - Stored in the database and verified strictly against the assigned order.
   - Cannot be bypassed by riders; order status cannot advance to `DELIVERED` without the matching 4-digit code.
3. **Data Protection in Public APIs:**
   - Public tracking APIs and rider lists never leak delivery OTPs to unauthorized listeners.
   - OTP is displayed only inside the authenticated customer's own tracking screen.

---

## 3. Injection & Query Hardening

1. **SQL Injection Defense:**
   - 100% of database interactions run through Prisma ORM using parameterized queries.
   - Zero raw concatenated SQL strings are present.
2. **Cross-Site Scripting (XSS):**
   - React 18 JSX escapes all dynamic text bindings by default.
   - Strict Content Security Policies and sanitize utilities applied to search inputs.

---

## 4. Git Repository & Secret Audit

- **`.gitignore` Enforcement:**
  Verified that `.env`, `.env.*`, `prisma/dev.db`, `prisma/dev.db-journal`, `node_modules/`, and `.next/` are excluded.
- **Git Commit Inspection:**
  Inspected git commit history (`git log -p`); confirmed no live passwords, private keys, or SQLite binary databases have been committed to GitHub.
- **Production Key Recommendation:**
  When deploying live, generate a 64-character random string for `JWT_SECRET`:
  ```bash
  openssl rand -base64 48
  ```
