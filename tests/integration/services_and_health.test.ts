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
});
