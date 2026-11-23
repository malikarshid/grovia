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

## 4. Default Access Credentials

| Portal | URL | Username / Email | Password | Role |
|---|---|---|---|---|
| **Delivery Rider Portal** | `/rider/login` | `rider_me` | `Rider@9682pw` | `RIDER` |
| **Admin Management Portal** | `/admin/login` | `admin_me` | `9682pw` | `SUPER_ADMIN` |
| **Customer Storefront** | `/auth/login` | `customer@grovia.in` | `Customer@123` | `CUSTOMER` |

*Security Policy:* Default credentials are controlled via `ALLOW_DEFAULT_INITIAL_PASSWORD="true"` in `.env`. In production without this flag, administrators and riders are required to use personal secure passwords.

---

## 5. Running the Verification Suite

Run all automated quality, security, and integration checks:

```bash
# 1. Validate Prisma schema
npx prisma validate

# 2. Verify strict TypeScript compilation
npx tsc --noEmit

# 3. Execute the full Vitest suite (10 suites, 66 tests)
npm test

# 4. Verify Next.js production compilation
npm run build
```
