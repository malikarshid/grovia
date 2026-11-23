# GROVIA: Database Backup, Restore & Disaster Recovery Playbook

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Scope:** Dual-Engine Architecture (SQLite Development & PostgreSQL Staging/Production)  
**Classification:** Operational Runbook  

---

## 1. Overview & Recovery Objectives

- **Recovery Point Objective (RPO):** Maximum 1 hour for transaction data; maximum 24 hours for catalog data.
- **Recovery Time Objective (RTO):** Service restored within 15 minutes of an outage.

---

## 2. PostgreSQL Production & Staging Backup Procedures

### 2.1 Automated Nightly Snapshots
Managed databases (AWS RDS, Supabase, Neon) provide automated daily backups with Point-In-Time Recovery (PITR). Ensure PITR is enabled with at least a 7-day retention window.

### 2.2 Manual Timestamped Logical Dump
Run before deploying new code releases or running database migrations:
```bash
# 1. Export database to compressed custom format
pg_dump "$POSTGRESQL_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="grovia_backup_$(date +%Y%m%d_%H%M%S).dump"

# 2. Verify dump file exists and has non-zero size
ls -lh grovia_backup_*.dump
```

### 2.3 Automated Backup Cron Script
For self-hosted or Docker PostgreSQL instances:
```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/grovia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/grovia_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

pg_dump "${POSTGRESQL_URL}" | gzip > "${BACKUP_FILE}"

# Retain backups for 14 days, delete older
find "${BACKUP_DIR}" -type f -name "grovia_*.sql.gz" -mtime +14 -delete

echo "Backup completed successfully: ${BACKUP_FILE}"
```

---

## 3. PostgreSQL Database Restore Playbook

### Step 1: Drain Application Traffic
Put application into maintenance mode or scale web instances to 0 to prevent writes during restoration:
```bash
# Set maintenance header or stop app server
pm2 stop grovia-staging
```

### Step 2: Restore Database from Dump
```bash
# Clean existing schema and restore from custom dump
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$POSTGRESQL_URL" \
  "grovia_backup_20261123_120000.dump"
```

### Step 3: Run Integrity & Count Verification
```bash
# Verify record counts in restored database
psql "$POSTGRESQL_URL" -c "SELECT count(*) FROM \"User\";"
psql "$POSTGRESQL_URL" -c "SELECT count(*) FROM \"Order\";"
psql "$POSTGRESQL_URL" -c "SELECT count(*) FROM \"Product\";"
```

### Step 4: Resume Application Traffic & Health Check
```bash
pm2 start grovia-staging
curl -i https://staging.grovia.in/api/health
```

---

## 4. SQLite Development Database Backup (Local Development)

To back up the local development database safely without file locking issues:
```bash
# 1. Create a safe copy of dev.db using SQLite backup API or copy
npx prisma db push --skip-generate

# 2. Copy dev.db with timestamp
cp prisma/dev.db "prisma/dev_backup_$(date +%Y%m%d_%H%M%S).db"
```
