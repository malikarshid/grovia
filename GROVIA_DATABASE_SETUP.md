# GROVIA: Staging & Production Database Setup Guide

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Version:** 1.0.0 (Staging Preparation)  
**Database Architecture:** Dual-Engine Architecture (SQLite for Local Development, PostgreSQL for Staging and Production)  
**Current Status:** Schema & DDL **VERIFIED / IMPLEMENTED** | Live Staging Execution: **NOT TESTED / BLOCKED** (Awaiting Staging Database Provisioning)

---

## 1. Database Architecture Overview

GROVIA utilizes an enterprise-grade dual-engine database architecture managed via Prisma ORM:

```
                      +---------------------------------------+
                      |         Prisma Schema Definition      |
                      +---------------------------------------+
                                     |         |
                  +------------------+         +------------------+
                  |                                               |
                  v                                               v
     +--------------------------+                   +--------------------------+
     |   prisma/schema.prisma   |                   | prisma/schema.postgresql |
     |      (Engine: SQLite)    |                   |    (Engine: PostgreSQL)  |
     +--------------------------+                   +--------------------------+
                  |                                               |
                  v                                               v
     +--------------------------+                   +--------------------------+
     |   Local Development DB   |                   |  Staging / Production DB |
     |      prisma/dev.db       |                   |  Supabase / AWS RDS /    |
     |  (Zero External Setup)   |                   |  Neon / Cloud PostgreSQL |
     +--------------------------+                   +--------------------------+
```

### Safety Guarantee
- **Local Isolation:** The local SQLite database (`prisma/dev.db`) is isolated from staging operations.
- **Non-Destructive Migrations:** Staging migrations use strict additive DDL scripts without dropping existing production tables or schemas.

---

## 2. PostgreSQL Schema & Migration Files

1. **PostgreSQL Prisma Schema:**
   - Location: `prisma/schema.postgresql.prisma`
   - Provider: `postgresql`
   - Direct URL Variable: `POSTGRESQL_URL`
   - Validation Status: **VERIFIED** via `npx prisma validate --schema prisma/schema.postgresql.prisma`
2. **Pre-Compiled Migration DDL:**
   - Location: `prisma/migrations/0_init_postgresql/migration.sql`
   - Line Count: 1,152 lines of ANSI-standard PostgreSQL DDL
   - Tables Defined: 44 relational models
   - Indexes: 37 unique indexes for high-throughput lookup (users, orders, products, deliveries, slugs, barcodes)
   - Foreign Keys: Explicit foreign key constraints with `ON DELETE CASCADE`, `ON DELETE SET NULL`, and `ON DELETE RESTRICT`
3. **Synchronization Automation:**
   - Script: `scripts/sync_pg_schema.js`
   - Automatically synchronizes model definitions from SQLite schema to PostgreSQL format while preserving PostgreSQL datasource declarations.

---

## 3. Step-by-Step Staging Database Deployment

Follow this exact sequence when provisioning a new staging PostgreSQL database:

### Step 1: Provision Managed PostgreSQL Instance
Choose a modern cloud PostgreSQL provider:
- **Supabase / Neon / AWS RDS / GCP Cloud SQL**
- Recommended Version: PostgreSQL 15 or 16
- Connection Pooling: Use Transaction-mode connection pooling (e.g. PgBouncer on port 6543 for Supabase).

### Step 2: Configure Environment Variable
In your staging deployment platform (e.g. Vercel, Render, AWS ECS, or Docker):
```bash
POSTGRESQL_URL="postgresql://grovia_admin:SECURE_PASSWORD@db-staging.grovia.internal:5432/grovia_staging?schema=public&sslmode=require"
DATABASE_URL="postgresql://grovia_admin:SECURE_PASSWORD@db-staging.grovia.internal:5432/grovia_staging?schema=public&sslmode=require"
```

### Step 3: Execute Schema Migration
Run the pre-compiled, non-destructive migration DDL:
```bash
# Option A: Direct SQL execution via psql
psql "$POSTGRESQL_URL" -f prisma/migrations/0_init_postgresql/migration.sql

# Option B: Prisma migrate deployment
npx prisma migrate deploy --schema prisma/schema.postgresql.prisma
```

### Step 4: Verify Schema Connectivity & Tables
```bash
# Verify connection and table counts
psql "$POSTGRESQL_URL" -c "\dt"
```
Ensure all 44 tables are listed:
`User`, `CustomerProfile`, `Address`, `Product`, `Category`, `Department`, `Order`, `OrderItem`, `Payment`, `Delivery`, `RiderProfile`, `RiderAssignment`, `FulfilmentCentre`, `Inventory`, etc.

### Step 5: Seed Staging Marketplace Catalog
Populate the staging database with initial categories, verified grocery catalogue items, default fulfilment centres, and administrative roles:
```bash
node prisma/seed-marketplace.js
```

---

## 4. Database Backup, Rollback & Disaster Recovery

### Automated Backup Procedure (Staging / Production)
Execute daily automated snapshots and pre-migration backups:
```bash
# Create a timestamped SQL dump before any release
pg_dump "$POSTGRESQL_URL" --format=custom --file="grovia_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Rollback Procedure
If a migration or bad deployment needs immediate rollback:
1. Revert application container to the previous release tag in Git.
2. If data restoration is required:
```bash
pg_restore --clean --if-exists --dbname="$POSTGRESQL_URL" "grovia_backup_PREVIOUS.dump"
```

---

## 5. Status & Blocker Audit

| Component | Status | Detail |
|---|---|---|
| PostgreSQL Schema Definition | **VERIFIED** | Syntax validated against Prisma engine |
| PostgreSQL DDL Migration SQL | **VERIFIED** | 1,152 lines compiled and validated |
| Local SQLite Development DB | **VERIFIED** | Fully active with test dataset |
| Staging Server Database Run | **NOT TESTED / BLOCKED** | Requires operator to provision PostgreSQL staging host |
