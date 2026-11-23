# GROVIA Deployment & Production Guide

This guide describes deploying GROVIA to modern cloud platforms (Vercel, AWS, DigitalOcean, or Docker).

---

## 1. Prerequisites
- Node.js 18.18+ or 20+
- PostgreSQL database (Supabase, Neon, Railway, or managed AWS RDS)

---

## 2. Environment Variables Checklist
Configure the following environment variables in your hosting environment:

```env
# Application URLs
NEXT_PUBLIC_APP_NAME="GROVIA"
NEXT_PUBLIC_APP_TAGLINE="Fresh Living. Smarter Shopping."
NEXT_PUBLIC_APP_URL="https://your-grovia-domain.com"

# Database Connection
DATABASE_URL="postgresql://username:password@your-db-host:5432/grovia?sslmode=require"

# Secrets
JWT_SECRET="generate-a-strong-random-64-character-string"
NEXTAUTH_SECRET="generate-another-strong-secret-key"

# Payment Gateway (Optional)
PAYMENT_MODE="DEMO" # Set to "LIVE" when Razorpay credentials are added
RAZORPAY_KEY_ID="rzp_live_your_actual_key"
RAZORPAY_KEY_SECRET="your_actual_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_your_actual_key"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 3. Deployment Steps on Vercel

1. Push your repository to GitHub or GitLab.
2. Import the project in Vercel.
3. In Project Settings, configure the environment variables listed above.
4. Set Build Command:
   ```bash
   npx prisma generate --schema=prisma/schema.postgresql.prisma && npm run build
   ```
5. Deploy.
6. Once deployed, run the seed script once to populate catalog and admin roles:
   ```bash
   node prisma/seed.js
   ```

---

## 4. Health Check & Monitoring
- Storefront health: `GET https://your-grovia-domain.com/api/settings`
- Admin dashboard: `https://your-grovia-domain.com/admin`
