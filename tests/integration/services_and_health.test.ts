import { describe, it, expect } from 'vitest';
import { GET as healthHandler } from '@/app/api/health/route';
import { PaymentService } from '@/services/paymentService';
import { MapsService } from '@/services/mapsService';
import { CourierService } from '@/services/courierService';
import crypto from 'crypto';

describe('GROVIA Core Services, Health Check & External Architecture Verification', () => {
  it('1. GET /api/health returns healthy operational status and database metrics', async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('HEALTHY');
    expect(json.database.status).toBe('CONNECTED');
    expect(json.database.counts.users).toBeGreaterThan(0);
    expect(json.database.counts.products).toBeGreaterThan(0);
    expect(json.services.authentication).toBe('OPERATIONAL');
  });

  it('2. PaymentService safely creates orders and enforces cryptographic HMAC signatures', async () => {
    // Order creation in standby mode
    const order = await PaymentService.createRazorpayOrder({
      amount: 499.5,
      receipt: 'GRO-TEST-101',
    });

    expect(order.id).toBeDefined();
    expect(order.amount).toBe(49950); // in paise
    expect(order.currency).toBe('INR');

    // Signature verification logic
    const testSecret = 'grovia_test_secret_2026';
    const razorpayOrderId = 'order_test_999';
    const razorpayPaymentId = 'pay_test_888';

    const hmac = crypto.createHmac('sha256', testSecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const validSignature = hmac.digest('hex');

    // Verification check using same HMAC
    process.env.RAZORPAY_KEY_SECRET = testSecret;
    const isVerified = PaymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature,
    });
    expect(isVerified).toBe(true);

    // Invalid signature check
    const isTampered = PaymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: 'tampered_invalid_hex_string_1234567890abcdef',
    });
    expect(isTampered).toBe(false);
  });

  it('3. MapsService calculates accurate distances using Haversine formula with urban factor', async () => {
    // Connaught Place to Indiranagar (long distance test)
    const distanceKm = MapsService.calculateHaversineDistance(28.6304, 77.2177, 12.9784, 77.6408);
    expect(distanceKm).toBeGreaterThan(1700);
    expect(distanceKm).toBeLessThan(1800);

    // Local Bengaluru distance test (Indiranagar to Koramangala)
    const local = await MapsService.calculateDistance(12.9784, 77.6408, 12.9352, 77.6245);
    expect(local.distanceKm).toBeGreaterThan(4);
    expect(local.distanceKm).toBeLessThan(12);
    expect(local.durationMinutes).toBeGreaterThan(10);
    expect(local.provider).toBe('HAVERSINE_SPHERICAL_FALLBACK');
  });

  it('4. CourierService generates valid manifests and tracks nationwide shipments', async () => {
    const manifest = await CourierService.manifestShipment({
      orderId: 'ord_123',
      orderNumber: 'GRO-2026-1234',
      originPincode: '441108',
      destinationPincode: '110001',
      destinationAddress: {
        fullName: 'Test Recipient',
        phone: '+91 98000 00000',
        street: 'Barakhamba Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      weightKg: 2.5,
      itemCount: 4,
      totalAmount: 850,
      paymentMode: 'PREPAID',
    });

    expect(manifest.success).toBe(true);
    expect(manifest.awbCode).toContain('110001');

    const tracking = CourierService.getTrackingTimeline(manifest.awbCode, '110001');
    expect(tracking.awbCode).toBe(manifest.awbCode);
    expect(tracking.checkpoints.length).toBe(4);
    expect(tracking.checkpoints[0].status).toBe('MANIFESTED');
  });

  it('5. Webhook processing correctly handles payment.captured, duplicate idempotency and payment.failed', async () => {
    const { POST: webhookHandler } = await import('@/app/api/payment/webhook/route');
    const prisma = (await import('@/lib/prisma')).default;

    // Find or create test customer and order
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    const address = await prisma.address.findFirst();

    if (customer && address) {
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: `ORD-WH-TEST-${Date.now()}`,
          userId: customer.id,
          addressId: address.id,
          subtotal: 500,
          total: 500,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          deliveryOtp: '1234',
        },
      });

      const testSecret = 'wh_test_secret_2026';
      process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

      const capturedPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_test_${Date.now()}`,
              amount: 50000,
              method: 'UPI',
              notes: {
                orderId: testOrder.id,
              },
            },
          },
        },
      });

      const hmac1 = crypto.createHmac('sha256', testSecret);
      hmac1.update(capturedPayload);
      const signature1 = hmac1.digest('hex');

      // 1. Send first payment.captured webhook
      const req1 = new (await import('next/server')).NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature1,
        },
        body: capturedPayload,
      });

      const res1 = await webhookHandler(req1);
      expect(res1.status).toBe(200);

      const updatedOrder1 = await prisma.order.findUnique({ where: { id: testOrder.id } });
      expect(updatedOrder1?.paymentStatus).toBe('PAID');

      // 2. Duplicate webhook idempotency test: send identical webhook again
      const reqDuplicate = new (await import('next/server')).NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature1,
        },
        body: capturedPayload,
      });

      const resDuplicate = await webhookHandler(reqDuplicate);
      expect(resDuplicate.status).toBe(200);

      // Verify no duplicate payments created
      const paymentsCount = await prisma.payment.count({ where: { orderId: testOrder.id } });
      expect(paymentsCount).toBe(1);

      // 3. Test payment.failed event
      const failedOrder = await prisma.order.create({
        data: {
          orderNumber: `ORD-WH-FAIL-${Date.now()}`,
          userId: customer.id,
          addressId: address.id,
          subtotal: 750,
          total: 750,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          deliveryOtp: '5678',
        },
      });

      const failedPayload = JSON.stringify({
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: `pay_failed_${Date.now()}`,
              amount: 75000,
              method: 'CARD',
              notes: {
                orderId: failedOrder.id,
              },
            },
          },
        },
      });

      const hmac2 = crypto.createHmac('sha256', testSecret);
      hmac2.update(failedPayload);
      const signature2 = hmac2.digest('hex');

      const reqFailed = new (await import('next/server')).NextRequest('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature2,
        },
        body: failedPayload,
      });

      const resFailed = await webhookHandler(reqFailed);
      expect(resFailed.status).toBe(200);

      const updatedOrder2 = await prisma.order.findUnique({ where: { id: failedOrder.id } });
      expect(updatedOrder2?.paymentStatus).toBe('FAILED');
    }
  });

  it('6. MapsService gracefully handles missing or invalid API keys with fallback calculation', async () => {
    // Force invalid key
    process.env.GOOGLE_MAPS_SERVER_API_KEY = 'invalid_key_testing_123';
    const result = await MapsService.calculateDistance(12.9784, 77.6408, 12.9352, 77.6245);
    expect(result.distanceKm).toBeGreaterThan(0);
    expect(result.durationMinutes).toBeGreaterThan(0);
    expect(result.provider).toBe('HAVERSINE_SPHERICAL_FALLBACK');
  });

  it('7. CourierService identifies simulator vs configured carrier credentials', async () => {
    // In unconfigured state
    delete process.env.DELHIVERY_API_TOKEN;
    delete process.env.SHIPROCKET_API_EMAIL;
    expect(CourierService.isDelhiveryConfigured()).toBe(false);
    expect(CourierService.isShiprocketConfigured()).toBe(false);

    const mockManifest = await CourierService.manifestShipment({
      orderId: 'ord_mock',
      orderNumber: 'ORD-MOCK-1',
      originPincode: '441108',
      destinationPincode: '560001',
      destinationAddress: {
        fullName: 'Bangalore Recipient',
        phone: '+91 99999 11111',
        street: 'MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      weightKg: 1.0,
      itemCount: 2,
      totalAmount: 350,
      paymentMode: 'PREPAID',
    });

    expect(mockManifest.carrierProvider).toBe('STANDBY_SIMULATOR');
    expect(mockManifest.isLiveIntegration).toBe(false);

    // Simulated configured state
    process.env.DELHIVERY_API_TOKEN = 'live_test_token_12345';
    expect(CourierService.isDelhiveryConfigured()).toBe(true);

    const liveManifest = await CourierService.manifestShipment({
      orderId: 'ord_live',
      orderNumber: 'ORD-LIVE-1',
      originPincode: '441108',
      destinationPincode: '560001',
      destinationAddress: {
        fullName: 'Bangalore Recipient',
        phone: '+91 99999 11111',
        street: 'MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      weightKg: 1.0,
      itemCount: 2,
      totalAmount: 350,
      paymentMode: 'PREPAID',
    });

    expect(liveManifest.carrierProvider).toBe('DELHIVERY');
    expect(liveManifest.isLiveIntegration).toBe(true);
    delete process.env.DELHIVERY_API_TOKEN;
  });

  it('8. Public order tracking strictly hides delivery OTP and masks PII for unauthenticated callers', async () => {
    const { GET: trackingHandler } = await import('@/app/api/driver/tracking/[orderId]/route');
    const prisma = (await import('@/lib/prisma')).default;
    const { generateToken } = await import('@/lib/auth');

    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    const address = await prisma.address.findFirst();

    if (customer && address) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-TRACK-SEC-${Date.now()}`,
          userId: customer.id,
          addressId: address.id,
          subtotal: 300,
          total: 300,
          orderStatus: 'CONFIRMED',
          deliveryOtp: '7788',
        },
      });

      // 1. Unauthenticated request - must NOT have verificationOtp and address must be masked
      const unauthReq = new (await import('next/server')).NextRequest(`http://localhost:3000/api/driver/tracking/${order.id}`);
      const unauthRes = await trackingHandler(unauthReq, { params: { orderId: order.id } });
      expect(unauthRes.status).toBe(200);

      const unauthJson = await unauthRes.json();
      expect(unauthJson.verificationOtp).toBeUndefined();
      expect(unauthJson.order.customerName).toContain('*');
      expect(unauthJson.order.shippingAddress).not.toContain(address.houseNumber);

      // 2. Authenticated request as owner - must include verificationOtp
      const ownerToken = generateToken({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role as any,
      });

      const authReq = new (await import('next/server')).NextRequest(`http://localhost:3000/api/driver/tracking/${order.id}`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const authRes = await trackingHandler(authReq, { params: { orderId: order.id } });
      expect(authRes.status).toBe(200);

      const authJson = await authRes.json();
      expect(authJson.verificationOtp).toBe('7788');
      expect(authJson.order.customerName).toBe(customer.name);
    }
  });

  it('9. Customer order cancellation restores product stock and marks prepaid orders as REFUNDED', async () => {
    const { PATCH: patchOrderHandler } = await import('@/app/api/orders/[id]/route');
    const prisma = (await import('@/lib/prisma')).default;
    const { generateToken } = await import('@/lib/auth');

    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    const address = await prisma.address.findFirst();
    const product = await prisma.product.findFirst({ where: { stock: { gt: 5 } } });

    if (customer && address && product) {
      const initialStock = product.stock;

      // Create an order with 2 units deducted
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-CANCEL-TEST-${Date.now()}`,
          userId: customer.id,
          addressId: address.id,
          subtotal: product.price * 2,
          total: product.price * 2,
          orderStatus: 'PENDING',
          paymentStatus: 'PAID',
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                unit: product.unit,
                price: product.price,
                quantity: 2,
                total: product.price * 2,
              },
            ],
          },
        },
      });

      // Deduct stock for the test
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: initialStock - 2 },
      });

      const customerToken = generateToken({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role as any,
      });

      // Customer cancels order
      const cancelReq = new (await import('next/server')).NextRequest(`http://localhost:3000/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          orderStatus: 'CANCELLED',
          cancellationReason: 'Changed mind before dispatch',
        }),
      });

      const cancelRes = await patchOrderHandler(cancelReq, { params: { id: order.id } });
      expect(cancelRes.status).toBe(200);

      // Verify stock restored in database
      const restoredProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(restoredProduct?.stock).toBe(initialStock);

      // Verify payment marked as REFUNDED
      const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
      expect(updatedOrder?.orderStatus).toBe('CANCELLED');
      expect(updatedOrder?.paymentStatus).toBe('REFUNDED');
    }
  });

  it('10. Rider order details do not expose customer OTP, and duplicate delivery completion is prevented', async () => {
    const { GET: getRiderOrderDetail } = await import('@/app/api/rider/orders/[id]/route');
    const { POST: updateStatusHandler } = await import('@/app/api/rider/orders/[id]/status/route');
    const prisma = (await import('@/lib/prisma')).default;
    const { generateToken } = await import('@/lib/auth');

    const riderUser = await prisma.user.findFirst({ where: { role: 'RIDER' } });
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    const address = await prisma.address.findFirst();

    if (riderUser && customer && address) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-RIDER-SEC-${Date.now()}`,
          userId: customer.id,
          addressId: address.id,
          subtotal: 400,
          total: 400,
          orderStatus: 'PROCESSING',
          deliveryOtp: '9182',
          delivery: {
            create: {
              trackingNumber: `TRK-SEC-${Date.now()}`,
              status: 'ACCEPTED',
              riderId: riderUser.id,
            },
          },
          riderAssignments: {
            create: {
              riderId: riderUser.id,
              status: 'ACCEPTED',
            },
          },
        },
        include: { riderAssignments: true, delivery: true },
      });

      const riderToken = generateToken({
        id: riderUser.id,
        name: riderUser.name,
        email: riderUser.email,
        role: riderUser.role as any,
      });

      // 1. Rider order detail query must NOT contain delivery OTP
      const detailReq = new (await import('next/server')).NextRequest(`http://localhost:3000/api/rider/orders/${order.id}`, {
        headers: {
          Authorization: `Bearer ${riderToken}`,
        },
      });

      const detailRes = await getRiderOrderDetail(detailReq, { params: { id: order.id } });
      expect(detailRes.status).toBe(200);

      const detailJson = await detailRes.json();
      expect(detailJson.order.delivery.verificationOtp).toBeUndefined();
      expect(detailJson.order.delivery.requiresOtp).toBe(true);

      // 2. Deliver the order with OTP
      const deliverReq = new (await import('next/server')).NextRequest(`http://localhost:3000/api/rider/orders/${order.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${riderToken}`,
        },
        body: JSON.stringify({
          nextStatus: 'DELIVERED',
          otp: '9182',
        }),
      });

      const deliverRes = await updateStatusHandler(deliverReq, { params: { id: order.id } });
      expect(deliverRes.status).toBe(200);

      // 3. Duplicate delivery attempt must return early without error or duplicate earnings
      const duplicateReq = new (await import('next/server')).NextRequest(`http://localhost:3000/api/rider/orders/${order.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${riderToken}`,
        },
        body: JSON.stringify({
          nextStatus: 'DELIVERED',
          otp: '9182',
        }),
      });

      const duplicateRes = await updateStatusHandler(duplicateReq, { params: { id: order.id } });
      expect(duplicateRes.status).toBe(200);

      const dupJson = await duplicateRes.json();
      expect(dupJson.status).toBe('DELIVERED');

      // Verify single earning record in database
      const earningsCount = await prisma.riderEarning.count({
        where: { orderId: order.id, riderId: riderUser.id },
      });
      expect(earningsCount).toBe(1);
    }
  });
});
