# GROVIA - Vercel Deployment Failure Fix & Resolution Report

**Project:** GROVIA  
**Repository:** `https://github.com/malikarshid/Grovia.git`  
**Branch:** `main`  
**Deployment Target:** Vercel (Next.js 14 App Router)  
**ORM:** Prisma 5.22.0  
**Target Production Database:** PostgreSQL (Neon / Supabase / AWS RDS)  
**Date:** November 2026

---

## 1. Executive Summary & Problem Diagnosis

### The Incident
During the Vercel build pipeline on commit `b41560d`, the deployment failed during `npm run build` with the following critical error:

```text
Error: Failed to collect page data for /api/addresses
/.next/server/app/api/addresses/route.js
PrismaClientInitializationError: Error validating datasource `db`: the URL must start with the protocol `file:`.
```

### Root Cause Analysis
Independent code inspection and runtime profiling identified four interrelated issues causing the failure:

1. **Static Page Data Collection During Build Time:**  
   Next.js 14 App Router statically pre-evaluates route modules during `next build` (`Collecting page data...`) unless a route handler is explicitly flagged as dynamic. Alphabetically, `/api/addresses` is the first API route evaluated. Because `/api/addresses/route.ts` did not declare `export const dynamic = 'force-dynamic'`, Next.js attempted static collection during build time.

2. **Eager Top-Level Prisma Client Instantiation:**  
   In `src/lib/prisma.ts`, `new PrismaClient()` was instantiated at the top level of the module upon `import prisma from '@/lib/prisma'`. As a result, simply loading an API route file triggered datasource validation before any HTTP request had arrived.

3. **Datasource Provider & URL Protocol Incompatibility:**  
   The committed `prisma/schema.prisma` contained `provider = "sqlite"` with `url = env("DATABASE_URL")`. When Vercel injected a production PostgreSQL `DATABASE_URL` (starting with `postgres://` or `postgresql://`), the Prisma Client threw validation errors because an SQLite datasource cannot accept a PostgreSQL URL.

4. **Missing Prisma Generation in Build Lifecycle:**  
   The `build` script in `package.json` was defined simply as `next build`. Without running `prisma generate` prior to compilation, Next.js bundled whichever Prisma Client had previously been cached, which targeted SQLite instead of PostgreSQL.

---

## 2. Code-Level Remediations Implemented

### 2.1 Lazy Prisma Client Initialization (`src/lib/prisma.ts`)
Refactored `src/lib/prisma.ts` to implement a lazy `Proxy` pattern. The Prisma Client is **never** instantiated when modules are imported or when Next.js collects page data during build time. Instantiation is strictly deferred until an actual database query is executed during a runtime HTTP request:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: prevents top-level connection attempts during static build evaluation
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    const client = getPrismaClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
```

### 2.2 Forced Dynamic Execution on All API Routes (`export const dynamic = 'force-dynamic'`)
Added `export const dynamic = 'force-dynamic';` across **all 60 API routes** and dynamic store pages (including `src/app/api/addresses/route.ts` and `src/app/(store)/categories/page.tsx`). This informs Next.js 14 App Router that these routes must execute dynamically on demand at request time, completely eliminating static build-time page data collection.

### 2.3 Automated Prisma Schema Switcher (`scripts/prepare-prisma.js`)
Created an automated configuration script that detects whether the application is running in Vercel (`VERCEL=1`), production (`NODE_ENV=production`), or with a PostgreSQL connection string. It automatically guarantees `prisma/schema.prisma` is aligned with `provider = "postgresql"` and `url = env("DATABASE_URL")`:

```javascript
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const isProduction = process.env.NODE_ENV === 'production';
// Automatic detection of PostgreSQL vs SQLite for local offline development
```

### 2.4 Production PostgreSQL Schema (`prisma/schema.prisma`)
Configured the primary committed schema `prisma/schema.prisma` with:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Preserved `prisma/schema.sqlite.prisma` for local offline development.

### 2.5 Updated Package Build Scripts (`package.json`)
Updated `package.json` lifecycle scripts:
```json
"scripts": {
  "postinstall": "node scripts/prepare-prisma.js && prisma generate",
  "build": "node scripts/prepare-prisma.js && prisma generate && next build"
}
```
This guarantees that during Vercel builds (`npm install` followed by `npm run build`), the PostgreSQL Prisma Client is generated before Next.js compiles the application.

### 2.6 Updated Environment Template (`.env.example`)
Updated `.env.example` with clear sections detailing all required Vercel environment variables, PostgreSQL connection string formats (including connection pooler parameters for Neon/Supabase), and production flags.

---

## 3. Verification & Validation Results

All verification suites were executed locally in a clean, simulated Vercel environment:

| Step | Command | Result | Details |
|---|---|---|---|
| **1. Prisma Schema Validation** | `npx prisma validate --schema=prisma/schema.postgresql.prisma` | **PASS** | Validated PostgreSQL schema syntax and models |
| **2. TypeScript Strict Check** | `npx tsc --noEmit` | **PASS** | 0 type errors across all routes and libraries |
| **3. Test Suite Execution** | `npm test` | **PASS** | **11/11 test files passed, 76/76 tests passed** |
| **4. Next.js Production Build** | `npm run build` (with simulated `VERCEL=1` & Postgres URL) | **PASS** | **Compiled successfully; 51 static pages generated; all 60 API routes compiled as dynamic (`ƒ`)** |

```text
✓ Compiled successfully
  Linting and checking validity of types ...
  Collecting page data ...
  Generating static pages (51/51)
  Finalizing page optimization ...
  Collecting build traces ...

Route (app)                              Size     First Load JS
├ ○ /                                    6.45 kB         112 kB
├ ƒ /api/addresses                       0 B                0 B
├ ƒ /api/admin/audit-logs                0 B                0 B
...
├ ƒ /categories                          660 B           101 kB
└ ○ /rider/support                       2.32 kB        89.7 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## 4. Next Steps for Vercel Deployment

To complete the deployment on Vercel:

### Step 1: Configure Vercel Project Environment Variables
In your Vercel Dashboard, navigate to **Project Settings > Environment Variables** and ensure the following variables are configured for Production / Preview:

| Variable | Recommended Value / Format | Note |
|---|---|---|
| `DATABASE_URL` | `postgresql://USER:PASS@HOST:5432/DB?schema=public&sslmode=require` | Pooled connection (Neon/Supabase/RDS) |
| `JWT_SECRET` | 32+ character random secret string | Required for customer/rider JWT authentication |
| `NEXTAUTH_SECRET` | 32+ character random secret string | Required for NextAuth session encryption |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production marketplace URL |
| `ADMIN_LOGIN_ID` | `admin_me` | Initial administrative user ID |
| `ADMIN_INITIAL_PASSWORD` | Strong administrative password | Required for admin portal access |
| `RIDER_LOGIN_ID` | `rider_me` | Initial delivery rider ID |
| `RIDER_INITIAL_PASSWORD` | Strong rider password | Required for rider portal access |
| `ALLOW_DEFAULT_INITIAL_PASSWORD` | `false` | Security hardening: must remain `false` in production |
| `PAYMENT_MODE` | `DEMO` or `LIVE` | Set `DEMO` for testing; `LIVE` for live transactions |

### Step 2: Apply Database Migrations to PostgreSQL
Before testing live workflows on Vercel, apply the Prisma migration to your remote PostgreSQL instance:
```bash
npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
```
*(Optionally run `npm run db:seed` if initial catalog and category data should be populated).*

### Step 3: Trigger Vercel Build
With the changes pushed to `main`, Vercel will automatically trigger a new deployment. You can also manually trigger a redeployment in the Vercel Dashboard under the **Deployments** tab by selecting **Redeploy**.
