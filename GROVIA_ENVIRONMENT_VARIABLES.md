# GROVIA: Environment Configuration & Variables Specification

**Project:** GROVIA — Fresh Living. Smarter Shopping.  
**Version:** 1.0.0  
**Security Classification:** Strict Confidential / Zero Credentials Committed

---

## 1. Overview & Security Policy

GROVIA adheres to strict twelve-factor application configuration principles. All dynamic runtime parameters, database connection strings, authentication secrets, and third-party vendor credentials are read exclusively through environment variables.

### Zero Secrets Rule
- **Never commit `.env`, `.env.local`, `.env.staging`, or `.env.production` files.**
- `.gitignore` rigorously excludes all variants of `.env*` except `.env.example`.
- `.env.example` provides an audited template with empty strings and dummy placeholders.

---

## 2. Comprehensive Variable Specification

### 2.1 Application Core & Runtime
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | All | String | `GROVIA` | Public application brand name |
| `NEXT_PUBLIC_APP_TAGLINE` | All | String | `Fresh Living. Smarter Shopping.` | Brand tagline |
| `NEXT_PUBLIC_APP_URL` | All | URL | `http://localhost:3000` | Canonical application base URL |
| `NODE_ENV` | All | Enum | `development` / `production` | Node.js execution environment |
| `PORT` | Staging/Prod | Number | `3000` | Port for the Next.js standalone server |

### 2.2 Database Configuration
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `DATABASE_URL` | All | Connection String | `file:./dev.db` (Local) | Active Prisma connection string |
| `POSTGRESQL_URL` | Staging/Prod | Connection String | `postgresql://user:pass@host:5432/db?schema=public` | Managed PostgreSQL connection string |

### 2.3 Authentication & Session Security
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `JWT_SECRET` | All | String | `minimum_32_character_cryptographic_secret` | Signs customer, admin & rider JWT tokens |
| `NEXTAUTH_SECRET` | All | String | `minimum_32_character_cryptographic_secret` | Session cookie encryption secret |
| `ADMIN_LOGIN_ID` | Seed/Init | String | `admin_me` | Initial seed username/email for admin |
| `ADMIN_INITIAL_PASSWORD` | Seed/Init | String | `your_strong_admin_password_here` | Initial seed password for super admin |
| `RIDER_LOGIN_ID` | Seed/Init | String | `rider_me` | Initial seed username/email for rider |
| `RIDER_INITIAL_PASSWORD` | Seed/Init | String | `your_strong_rider_password_here` | Initial seed password for rider |
| `ALLOW_DEFAULT_INITIAL_PASSWORD` | Dev only | Boolean | `false` (Must remain false in Staging/Prod) | Allows initial seeding with default fallback |

### 2.4 Payment Gateway (Razorpay & Standby Simulator)
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `RAZORPAY_KEY_ID` | Staging/Prod | String | `rzp_test_...` / `rzp_live_...` | Razorpay Merchant API Key ID |
| `RAZORPAY_KEY_SECRET` | Staging/Prod | String | `...` | Razorpay Merchant API Key Secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Staging/Prod | String | `rzp_test_...` | Public client key for Razorpay Checkout Modal |
| `RAZORPAY_WEBHOOK_SECRET` | Staging/Prod | String | `...` | Secret for validating `x-razorpay-signature` |
| `PAYMENT_MODE` | All | Enum | `DEMO` / `LIVE` | When `DEMO`, payments and refunds use verified standby engine |

### 2.5 Mapping & Geolocation (Google Maps Platform)
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | String | `AIzaSy...` | Client-side map rendering & Autocomplete |
| `GOOGLE_MAPS_SERVER_API_KEY` | Optional | String | `AIzaSy...` | Server-side Distance Matrix & Geocoding |
| *Fallback Behavior* | Active | - | `HAVERSINE_SPHERICAL_FALLBACK` | If keys missing, Haversine routing formula automatically engages |

### 2.6 Nationwide Courier & Logistics (Delhivery / Shiprocket)
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `DELHIVERY_API_TOKEN` | Staging/Prod | String | `...` | Client token for Delhivery B2C surface booking |
| `SHIPROCKET_API_EMAIL` | Staging/Prod | Email | `logistics@grovia.in` | Shiprocket account login email |
| `SHIPROCKET_API_PASSWORD` | Staging/Prod | String | `...` | Shiprocket API access password |
| *Fallback Behavior* | Active | - | `STANDBY_SIMULATOR` | If keys missing, automated timeline tracker simulates delivery |

### 2.7 Communications & Mail Services (SMTP)
| Variable | Required In | Type | Default / Example | Purpose |
|---|---|---|---|---|
| `SMTP_HOST` | Staging/Prod | Hostname | `smtp.sendgrid.net` / `smtp.mailgun.org` | Outgoing transactional mail server |
| `SMTP_PORT` | Staging/Prod | Integer | `587` / `2525` | SMTP port |
| `SMTP_USER` | Staging/Prod | String | `apikey` | SMTP username |
| `SMTP_PASSWORD` | Staging/Prod | String | `...` | SMTP password / API token |
| `FROM_EMAIL` | All | Email | `support@grovia.in` | Sender address on transactional emails |

---

## 3. Staging Configuration Template (`.env.staging`)

```bash
# Core
NODE_ENV="production"
NEXT_PUBLIC_APP_NAME="GROVIA Staging"
NEXT_PUBLIC_APP_TAGLINE="Fresh Living. Smarter Shopping."
NEXT_PUBLIC_APP_URL="https://staging.grovia.in"
PORT=3000

# Database
DATABASE_URL="postgresql://grovia_staging_user:SECURE_STAGING_PASSWORD@staging-db.grovia.internal:5432/grovia_staging?schema=public&sslmode=require"
POSTGRESQL_URL="postgresql://grovia_staging_user:SECURE_STAGING_PASSWORD@staging-db.grovia.internal:5432/grovia_staging?schema=public&sslmode=require"

# Auth
JWT_SECRET="staging_jwt_super_random_cryptographic_secret_64chars_long"
NEXTAUTH_SECRET="staging_nextauth_super_random_cryptographic_secret_64chars"
ALLOW_DEFAULT_INITIAL_PASSWORD="false"

# Payment
PAYMENT_MODE="DEMO" # Keep DEMO until live merchant sandbox keys are supplied
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="staging_webhook_secret_key"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder_key"

# Mapping & Logistics (Can remain blank to utilize verified mathematical fallbacks)
GOOGLE_MAPS_SERVER_API_KEY=""
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
DELHIVERY_API_TOKEN=""
SHIPROCKET_API_EMAIL=""
SHIPROCKET_API_PASSWORD=""

# Mail
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="staging_user"
SMTP_PASSWORD="staging_password"
FROM_EMAIL="staging-alerts@grovia.in"
```
