# GROVIA: PRODUCTION POSTGRESQL MIGRATION GUIDE
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Target Engine:** PostgreSQL 14+ / 15+ / 16+ (Supabase, Neon, AWS RDS, GCP Cloud SQL, or Self-Hosted)  
**Development Engine:** SQLite 3 (`prisma/dev.db`)  
**Schema Definition:** [`prisma/schema.postgresql.prisma`](prisma/schema.postgresql.prisma)  
**Pre-Compiled DDL Migration:** [`prisma/migrations/0_init_postgresql/migration.sql`](prisma/migrations/0_init_postgresql/migration.sql)

---

## 1. Architecture & Dual-Mode Strategy

GROVIA uses a dual-mode Prisma configuration that preserves friction-free zero-dependency local development on SQLite while providing a deployment pipeline for PostgreSQL in production.

| Attribute | Development Mode | Production Mode |
|---|---|---|
| **Database Engine** | SQLite 3 | PostgreSQL 14+ |
| **Connection Protocol** | `file:./dev.db` | `postgresql://user:password@host:5432/dbname?schema=public&sslmode=require` |
| **Driver** | `prisma-client-js` | `prisma-client-js` |
| **Concurrency / Pooling** | Single-file embedded | PgBouncer / Prisma Accelerate / AWS RDS Proxy |
| **Migrations** | `prisma db push` / idempotent seeds | `prisma migrate deploy` |

---

## 2. Model & Relation Verification

All 42 Prisma models, relational cascades, foreign keys, and indexes have been verified for strict PostgreSQL compatibility:
- **Primary Keys:** `@id @default(cuid())` mapping to `TEXT PRIMARY KEY`
- **Timestamps:** `DateTime @default(now())` mapping to `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`
- **Monetary Totals:** `Float` mapping to `DOUBLE PRECISION` (or `DECIMAL(10,2)` via DDL)
- **JSON Fields:** Serialized JSON strings in `AuditLog.details` with text indexing
- **Unique Constraints:** `User(email)`, `User(username)`, `Order(orderNumber)`, `RiderProfile(userId)`, `Category(slug)`, `Product(slug)`, `Brand(slug)`
- **Referential Actions:** Explicit `onDelete: Cascade`, `onDelete: SetNull`, and `onDelete: Restrict` rules defined across all relations.

---

## 3. Step-by-Step Production Migration Procedure

### Step 1: Provision Target PostgreSQL Instance
Provision a PostgreSQL database instance on your cloud provider (e.g. Supabase, Neon, AWS RDS, DigitalOcean, or Azure).

### Step 2: Configure Environment Variables
In your production environment, set:
```env
DATABASE_URL="postgresql://grovia_admin:YourStrongPassword123!@db-host.internal:5432/groviadb?schema=public&sslmode=require"
```

### Step 3: Switch Active Schema for Deployment
Run the automated synchronization script:
```bash
node scripts/sync_pg_schema.js
```
Or copy `prisma/schema.postgresql.prisma` to `prisma/schema.prisma` in your CI/CD pipeline:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

### Step 4: Run Prisma Migration Deploy
```bash
npx prisma migrate deploy
```
*Alternatively, execute the pre-compiled [`prisma/migrations/0_init_postgresql/migration.sql`](prisma/migrations/0_init_postgresql/migration.sql) directly using `psql`:*
```bash
psql "$DATABASE_URL" -f prisma/migrations/0_init_postgresql/migration.sql
```

### Step 5: Execute Idempotent Seed Scripts
Populate the initial catalog, administrative accounts, dark stores, and serviceable pincodes:
```bash
npm run prisma:seed
```

---

## 4. Backup & Disaster Recovery Procedures

### Automated Logical Backup (`pg_dump`)
```bash
pg_dump "$DATABASE_URL" --format=custom --file="grovia_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Point-in-Time Restoration (`pg_restore`)
```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "grovia_backup_20261123_120000.dump"
```
