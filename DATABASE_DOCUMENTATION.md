# GROVIA Database Documentation

## Relational Schema (Prisma ORM)

GROVIA's relational database supports both SQLite for instant out-of-the-box local development and PostgreSQL for high-scale cloud production.

### Core Tables

1. **User:** Core authentication and staff accounts (`id`, `name`, `email`, `passwordHash`, `role`, `avatar`, `isActive`, `createdAt`).
2. **CustomerProfile:** Shopper profiles with loyalty points.
3. **Address:** Delivery locations (`fullName`, `phone`, `houseNumber`, `street`, `area`, `city`, `state`, `pincode`, `instructions`).
4. **Category:** Product taxonomies (`name`, `slug`, `image`, `displayOrder`, `isActive`).
5. **Product:** Grocery catalog items (`name`, `slug`, `sku`, `price`, `originalPrice`, `unit`, `weight`, `stock`, `minStock`, `isFeatured`, `isBestSeller`, `rating`, `reviewCount`, `image`).
6. **ProductImage:** Additional product gallery images.
7. **ProductReview:** User product ratings and comments.
8. **Favorite:** Customer wishlist records.
9. **Cart & CartItem:** Persistent server-synced shopping carts.
10. **DeliverySlot:** Morning and evening delivery time slots with capacity tracking.
11. **Order:** Master order record (`orderNumber`, `userId`, `addressId`, `subtotal`, `discount`, `deliveryFee`, `tax`, `total`, `paymentMethod`, `paymentStatus`, `orderStatus`, `channel`).
12. **OrderItem:** Snapshot of purchased items with historical unit prices.
13. **Payment:** Transaction receipts (`transactionId`, `provider`, `method`, `amount`, `currency`, `status`).
14. **Delivery:** Dispatch and route tracking (`trackingNumber`, `status`, `deliveryPersonName`, `departureTime`, `deliveredTime`).
15. **DeliveryAssignment:** Fleet assignment logs.
16. **Inventory:** Current stock levels, minimum thresholds, and linked suppliers.
17. **StockMovement:** Historical ledger of every stock intake, sale, or manual adjustment with staff attribution.
18. **Supplier:** Farm cooperatives and FMCG distributors (`name`, `company`, `email`, `leadTimeDays`).
19. **SupplierProduct:** Cost price and procurement MOQ.
20. **Coupon & CouponUsage:** Promotional discount rules and customer redemption history.
21. **Notification:** In-app operational and customer notifications.
22. **StaffRole, Permission, StaffPermission:** Role-based access control policies.
23. **AuditLog:** Administrative actions and security audit log.
24. **StoreSettings:** Dynamic economic parameters (delivery fee, free shipping threshold, 5% GST, demo mode toggle).

---

## Switching to PostgreSQL in Production

To connect to a managed PostgreSQL database (e.g., Supabase, Neon, AWS RDS):
1. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/groviadb?schema=public"
   ```
2. Run database migration using the included PostgreSQL schema:
   ```bash
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   node prisma/seed.js
   ```
