# GROVIA: PRODUCTION DEPLOYMENT & OPERATIONS GUIDE
**Application:** GROVIA — Fresh Living. Smarter Shopping.  
**Version:** 1.0.0 Production-Ready  
**Framework:** Next.js 14 App Router + Prisma ORM + Tailwind CSS  

---

## 1. Hosting Architecture Options

GROVIA can be deployed across several production hosting architectures:

### Option A: Vercel (Serverless Edge + Managed Database)
- **Frontend & APIs:** Deployed directly to Vercel with automatic Edge Middleware support.
- **Database:** Supabase, Neon, or AWS RDS PostgreSQL.
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### Option B: Docker Container / Node.js VPS (DigitalOcean / AWS EC2 / GCP)
- **Runtime:** Node.js v18.17+ or v20+ with PM2 or Docker Compose.
- **Web Server:** Nginx reverse proxy with SSL termination (Let's Encrypt).
- **Process Manager:** PM2 cluster mode:
  ```bash
  pm2 start npm --name "grovia" -- start
  ```

---

## 2. Production Environment Checklist

Configure the following environment variables in your deployment settings:

```env
# Application Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_NAME="GROVIA"
NEXT_PUBLIC_APP_TAGLINE="Fresh Living. Smarter Shopping."
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"

# Production PostgreSQL Database
DATABASE_URL="postgresql://grovia_admin:YourSecurePassword123!@db-host:5432/groviadb?schema=public&sslmode=require"

# Security & Sessions
JWT_SECRET="generate_a_cryptographically_secure_64_char_random_key"
NEXTAUTH_SECRET="generate_a_cryptographically_secure_64_char_random_key"
ALLOW_DEFAULT_INITIAL_PASSWORD="false"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_live_your_actual_key"
RAZORPAY_KEY_SECRET="your_actual_live_secret"
RAZORPAY_WEBHOOK_SECRET="your_actual_webhook_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_your_actual_key"
PAYMENT_MODE="LIVE"

# Mapping & Geolocation APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyYourClientRestrictedKey"
GOOGLE_MAPS_SERVER_API_KEY="AIzaSyYourServerRestrictedKey"

# Logistics & Couriers
SHIPROCKET_API_EMAIL="logistics@grovia.in"
SHIPROCKET_API_PASSWORD="your_password"
DELHIVERY_API_TOKEN="your_token"
```

---

## 3. Database Migration Deployment

Before starting the web server on a new environment:
```bash
# 1. Sync PostgreSQL schema
node scripts/sync_pg_schema.js

# 2. Run migrations
npx prisma migrate deploy

# 3. Populate initial product catalog & dark stores
npm run prisma:seed
```

---

## 4. Health Monitoring & Observability

GROVIA provides a built-in health check endpoint at `/api/health`.

### Automated Uptime Monitoring
Configure your monitoring service (e.g. Better Uptime, UptimeRobot, Datadog) to ping:
`https://your-domain.com/api/health` every 60 seconds.

Expected HTTP 200 JSON Response:
```json
{
  "status": "HEALTHY",
  "database": {
    "status": "CONNECTED",
    "provider": "PostgreSQL",
    "latencyMs": 14
  },
  "services": {
    "authentication": "OPERATIONAL",
    "riderTelemetry": "OPERATIONAL",
    "inventoryEngine": "OPERATIONAL"
  }
}
```
