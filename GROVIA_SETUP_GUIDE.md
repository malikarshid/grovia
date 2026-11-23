# GROVIA: SETUP, RUNTIME & OPERATIONS GUIDE
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Version:** 1.0.0 Production-Ready  
**Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma ORM  

---

## 1. Quick Start Guide

### Prerequisites
- Node.js v18.17+ or v20+ (tested on Node.js v24)
- npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Initialize & Seed Database
```bash
# Push schema changes to SQLite (dev.db)
npx prisma db push

# Run idempotent seeds for catalog, security, admin, and rider portal
npm run prisma:seed
```

---

## 2. Running the Application

### Development Mode (Port 3000)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Start
```bash
# 1. Compile optimized production build
npm run build

# 2. Start Next.js production server
npm run start
```
By default, the server listens on `http://localhost:3000`.

---

## 3. Resolving Port 3000 Conflicts (`EADDRINUSE`)

If you see:
`Port 3000 is in use, trying 3001 instead.` or `EADDRINUSE: address already in use :::3000`

A previous background Node.js process is holding port 3000. Run the built-in clean script:

```bash
npm run clean:ports
```

Or manually in PowerShell:
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## 4. Initial Access Credentials Setup

| Portal | URL | Configured Username / Email | Initial Password Setup | Role |
|---|---|---|---|---|
| **Delivery Rider Portal** | `/rider/login` | `rider_me` (or `RIDER_LOGIN_ID`) | Configured via `RIDER_INITIAL_PASSWORD` in `.env` | `RIDER` |
| **Admin Management Portal** | `/admin/login` | `admin_me` (or `ADMIN_LOGIN_ID`) | Configured via `ADMIN_INITIAL_PASSWORD` in `.env` | `SUPER_ADMIN` |
| **Customer Storefront** | `/auth/login` | Registered customer email | Set by customer during registration (`/auth/register`) | `CUSTOMER` |

*Security Policy:* Default fallback passwords are strictly disabled by default. Administrators and riders must set their personal secure credentials via `.env` or during onboarding.

---

## 5. Running the Verification Suite

Run all automated quality, security, and integration checks:

```bash
# 1. Validate Prisma schemas (SQLite & PostgreSQL)
npx prisma validate
npx prisma validate --schema prisma/schema.postgresql.prisma

# 2. Verify strict TypeScript compilation
npx tsc --noEmit

# 3. Execute the full Vitest suite (11 suites, 73 tests)
npm test

# 4. Verify Next.js production compilation
npm run build
```
