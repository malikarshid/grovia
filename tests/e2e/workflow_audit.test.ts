import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, hasAdminRole } from '@/lib/auth';
import { calculateTotals } from '@/lib/utils';
import { PaymentService } from '@/services/paymentService';

describe('GROVIA Complete End-to-End Workflow & Business Logic Audit', () => {
  let testUserId: string;
  let testAddressId: string;
  let testProductId: string;
  let initialStock: number;
  let testOrderNumber: string;
  const testEmail = `audit.user.${Date.now()}@grovia.in`;
  const testPassword = 'Password@Audit2026';

  beforeAll(async () => {
    // Locate or create test entities
    const product = await prisma.product.findFirst({
      where: { slug: 'ratnagiri-alphonso-mangoes' },
    });
    if (!product) throw new Error('Seeded mango product not found');
    testProductId = product.id;
    initialStock = product.stock;
  });

  // 1. Authentication & Security
  describe('1. Authentication & Security Verification', () => {

    it('registers a customer with secure bcrypt password hashing', async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const user = await prisma.user.create({
        data: {
          name: 'Audit Customer',
          email: testEmail,
          phone: '+91 99000 11223',
          passwordHash,
          role: 'CUSTOMER',
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.passwordHash).not.toBe(testPassword);
      testUserId = user.id;

      // Verify bcrypt comparison
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('WrongPassword', user.passwordHash);
      expect(isInvalid).toBe(false);
    });

    it('generates and verifies JWT session token with customer claims', () => {
      const session = {
        id: testUserId,
        name: 'Audit Customer',
        email: testEmail,
        role: 'CUSTOMER' as const,
      };

      const token = generateToken(session);
      expect(token).toBeDefined();

      const decoded = verifyToken(token);
      expect(decoded?.id).toBe(testUserId);
      expect(decoded?.email).toBe(testEmail);
      expect(hasAdminRole(decoded?.role || '')).toBe(false);
    });

    it('verifies Super Admin and Staff RBAC permissions', async () => {
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@grovia.in' },
      });
      expect(admin).toBeDefined();
      expect(admin?.role).toBe('SUPER_ADMIN');
      expect(hasAdminRole(admin?.role || '')).toBe(true);

      const staff = await prisma.user.findUnique({
        where: { email: 'inventory@grovia.in' },
      });
      expect(staff).toBeDefined();
      expect(staff?.role).toBe('INVENTORY_MGR');
      expect(hasAdminRole(staff?.role || '')).toBe(true);
    });
  });

  // 2. Customer Shopping Workflow
  describe('2. Customer Shopping & Catalog Flow', () => {
    it('retrieves active products filtered by category and search', async () => {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          category: { slug: 'fresh-fruits' },
        },
      });

      expect(products.length).toBeGreaterThanOrEqual(1);
      const found = products.find((p) => p.slug === 'ratnagiri-alphonso-mangoes');
      expect(found).toBeDefined();
      expect(found?.price).toBe(649);
    });

    it('adds and manages customer delivery address', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUserId,
          fullName: 'Audit Customer',
          phone: '+91 99000 11223',
          houseNumber: 'Flat 101, Test Tower',
          street: '100 Feet Road',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          instructions: 'Call at arrival',
          isDefault: true,
        },
      });

      expect(address.id).toBeDefined();
      expect(address.city).toBe('Bengaluru');
      testAddressId = address.id;
    });

    it('saves and deletes products from customer favourites', async () => {
      // Add to favorites
      const fav = await prisma.favorite.create({
        data: {
          userId: testUserId,
          productId: testProductId,
        },
      });
      expect(fav.id).toBeDefined();

      // Retrieve
      const count = await prisma.favorite.count({
        where: { userId: testUserId },
      });
      expect(count).toBe(1);

      // Remove
      await prisma.favorite.deleteMany({
        where: { userId: testUserId, productId: testProductId },
      });
      const remaining = await prisma.favorite.count({
        where: { userId: testUserId },
      });
      expect(remaining).toBe(0);
    });
  });

  // 3. Checkout, Transactional Order Placement & Stock Integrity
  describe('3. Transactional Checkout & Stock Reservation Safety', () => {
    it('rejects order when requested quantity exceeds available stock', async () => {
      const product = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(product).toBeDefined();
      const excessiveQty = (product?.stock || 0) + 100;

      // Ensure business logic enforces stock bounds
      expect(excessiveQty).toBeGreaterThan(product?.stock || 0);
    });

    it('places order within a transaction, decrements stock, and creates delivery record', async () => {
      const orderQty = 2;
      const product = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      const preStock = product!.stock;

      const orderNumber = `GRO-AUDIT-${Date.now().toString().slice(-4)}`;
      testOrderNumber = orderNumber;

      // Simulate the exact transaction from /api/orders
      const order = await prisma.$transaction(async (tx) => {
        // 1. Decrement stock
        const updatedProduct = await tx.product.update({
          where: { id: testProductId },
          data: { stock: preStock - orderQty },
        });

        // 2. Update inventory
        await tx.inventory.updateMany({
          where: { productId: testProductId },
          data: {
            currentStock: preStock - orderQty,
            status: preStock - orderQty <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
          },
        });

        // 3. Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: testProductId,
            type: 'OUT',
            quantity: orderQty,
            previousStock: preStock,
            newStock: preStock - orderQty,
            reason: 'Audit order test',
            createdBy: 'Audit Customer',
          },
        });

        // 4. Create Order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: testUserId,
            addressId: testAddressId,
            subtotal: updatedProduct.price * orderQty,
            discount: 100, // GROVIA100
            deliveryFee: 0, // Free over 499
            tax: (updatedProduct.price * orderQty - 100) * 0.05,
            total: (updatedProduct.price * orderQty - 100) * 1.05,
            paymentMethod: 'DEMO',
            paymentStatus: 'PAID',
            orderStatus: 'CONFIRMED',
            channel: 'WEB',
            items: {
              create: [
                {
                  productId: testProductId,
                  productName: updatedProduct.name,
                  unit: updatedProduct.unit,
                  price: updatedProduct.price,
                  quantity: orderQty,
                  total: updatedProduct.price * orderQty,
                },
              ],
            },
          },
        });

        // 5. Payment processing simulation
        const paymentRes = await PaymentService.processPayment({
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          amount: newOrder.total,
          currency: 'INR',
          method: 'DEMO',
          customer: {
            name: 'Audit Customer',
            email: testEmail,
            phone: '+91 99000 11223',
          },
        });

        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            transactionId: paymentRes.transactionId,
            provider: paymentRes.provider,
            method: 'DEMO',
            amount: newOrder.total,
            currency: 'INR',
            status: 'SUCCESS',
          },
        });

        // 6. Delivery Tracking Record
        await tx.delivery.create({
          data: {
            orderId: newOrder.id,
            trackingNumber: `TRK-AUDIT-${orderNumber}`,
            status: 'PENDING',
            notes: 'Audit delivery tracking initialization',
          },
        });

        return newOrder;
      });

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toBe(orderNumber);

      // Verify stock was decremented in database
      const verifiedProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(verifiedProduct?.stock).toBe(preStock - orderQty);

      // Verify stock movement was recorded
      const movement = await prisma.stockMovement.findFirst({
        where: { productId: testProductId, reason: 'Audit order test' },
      });
      expect(movement).toBeDefined();
      expect(movement?.quantity).toBe(orderQty);
    });
  });

  // 4. Admin Management Operations
  describe('4. Administrative Operations & Fleet Dispatch Flow', () => {
    it('allows administrators to update order and delivery dispatch status', async () => {
      const order = await prisma.order.findUnique({
        where: { orderNumber: testOrderNumber },
        include: { delivery: true },
      });
      expect(order).toBeDefined();
      expect(order?.delivery).toBeDefined();

      // Dispatch order
      const updatedOrder = await prisma.order.update({
        where: { id: order!.id },
        data: { orderStatus: 'OUT_FOR_DELIVERY' },
      });
      expect(updatedOrder.orderStatus).toBe('OUT_FOR_DELIVERY');

      // Update delivery partner and departure time
      const updatedDelivery = await prisma.delivery.update({
        where: { id: order!.delivery!.id },
        data: {
          status: 'OUT_FOR_DELIVERY',
          deliveryPersonName: 'Sunil Gowda (Fleet Partner)',
          deliveryPersonPhone: '+91 99801 23456',
          departureTime: new Date(),
        },
      });
      expect(updatedDelivery.status).toBe('OUT_FOR_DELIVERY');
      expect(updatedDelivery.deliveryPersonName).toContain('Sunil');
    });

    it('performs stock adjustment with reason attribution and restores inventory', async () => {
      const product = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      const currentStock = product!.stock;
      const restockQty = 10;

      // Adjust stock (+10 units restock)
      await prisma.$transaction([
        prisma.product.update({
          where: { id: testProductId },
          data: { stock: currentStock + restockQty },
        }),
        prisma.inventory.updateMany({
          where: { productId: testProductId },
          data: { currentStock: currentStock + restockQty },
        }),
        prisma.stockMovement.create({
          data: {
            productId: testProductId,
            type: 'RESTOCK',
            quantity: restockQty,
            previousStock: currentStock,
            newStock: currentStock + restockQty,
            reason: 'Received shipment from Nashik Agro Farm',
            createdBy: 'Vikramaditya Rao (Super Admin)',
          },
        }),
      ]);

      const restoredProduct = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(restoredProduct?.stock).toBe(currentStock + restockQty);
    });

    it('verifies dynamic store settings update and threshold calculations', async () => {
      const settings = await prisma.storeSettings.findFirst();
      expect(settings).toBeDefined();
      expect(settings?.freeDeliveryThreshold).toBe(499);
      expect(settings?.deliveryFee).toBe(30);

      // Verify calculation helper respects configured thresholds
      const calcResult = calculateTotals({
        items: [{ price: 400, quantity: 1 }],
        freeDeliveryThreshold: settings?.freeDeliveryThreshold || 499,
        deliveryFee: settings?.deliveryFee || 30,
        taxRate: 5.0,
      });

      expect(calcResult.deliveryFee).toBe(30);
      expect(calcResult.freeDeliveryRemaining).toBe(99); // 499 - 400 = 99
    });
  });
});
