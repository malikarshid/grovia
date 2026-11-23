# GROVIA System Architecture

```
                    +------------------------------------------+
                    |             GROVIA Platform              |
                    |    Fresh Living. Smarter Shopping.       |
                    +------------------------------------------+
                                       |
          +----------------------------+----------------------------+
          |                                                         |
+---------------------+                                   +--------------------+
| Customer Experience |                                   |  Admin SaaS Portal |
|  - Mobile First     |                                   |  - Ops & Logistics |
|  - Cart & Checkout  |                                   |  - Inventory & CRM |
+---------------------+                                   +--------------------+
          |                                                         |
          +----------------------------+----------------------------+
                                       |
                   +---------------------------------------+
                   | Next.js App Router & Server API Layer |
                   | - Authentication & RBAC Middleware    |
                   | - Transactional Order Engine          |
                   | - Payment Gateway Abstraction         |
                   | - Real-time Stock Sync & Audit Log    |
                   +---------------------------------------+
                                       |
                   +---------------------------------------+
                   |         Prisma ORM Data Layer         |
                   +---------------------------------------+
                                       |
                 +---------------------+---------------------+
                 | (Local Dev / Test)  | (Production Ready)  |
                 |       SQLite        |     PostgreSQL      |
                 +---------------------+---------------------+
```

## Architectural Highlights

### 1. Unified State & Database Design
Both Customer and Admin applications communicate with identical database models via Prisma ORM. When an administrator adjusts stock in `/admin/inventory` or adds a product in `/admin/products`, changes reflect instantly in customer search and product pages.

### 2. Transactional Stock Safety
Order creation utilizes `prisma.$transaction`:
- Prevents overselling when multiple shoppers checkout simultaneously.
- Verifies real-time stock levels before payment processing.
- Automatically records `StockMovement` audit logs for each line item.

### 3. Payment Gateway Abstraction
`PaymentService` supports:
- Instant Verified Demo Gateway (zero configuration for testing).
- Cash on Delivery (doorstep payment).
- Razorpay / UPI integration architecture (activated when credentials are supplied in `.env`).

### 4. Tri-Theme Presentation Layer
Zero-flicker CSS variable implementation supporting:
- Standard Light Mode
- Dark Slate Mode
- Eye Protection Mode (low luminance, warm sepia, reduced blue light)
