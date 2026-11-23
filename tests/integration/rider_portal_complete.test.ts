import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

import { GET as getDashboard } from '@/app/api/rider/dashboard/route';
import { GET as getEarnings } from '@/app/api/rider/earnings/route';
import { GET as getProfile, PATCH as updateProfile } from '@/app/api/rider/profile/route';
import { GET as getAvailability, PATCH as updateAvailability } from '@/app/api/rider/availability/route';
import { POST as acceptOrder } from '@/app/api/rider/orders/[id]/accept/route';
import { POST as rejectOrder } from '@/app/api/rider/orders/[id]/reject/route';
import { POST as updateOrderStatus, PATCH as patchOrderStatus } from '@/app/api/rider/orders/[id]/status/route';
import { GET as getOrders } from '@/app/api/rider/orders/route';

describe('GROVIA Complete Rider Portal & Backend Integrity Tests', () => {
  let riderUser: any;
  let customerUser: any;
  let testOrder: any;
  let testAssignment: any;
  let riderToken: string;
  let customerToken: string;

  beforeAll(async () => {
    // 1. Create a dedicated isolated test rider user
    const testRiderEmail = `test.rider.${Date.now()}@grovia.in`;
    riderUser = await prisma.user.create({
      data: {
        name: 'Autonomous Test Rider',
        email: testRiderEmail,
        username: `test_rider_${Date.now()}`,
        phone: '+91 98450 12345',
        role: 'RIDER',
        passwordHash: 'testhash',
        isActive: true,
        isSuspended: false,
        riderProfile: {
          create: {
            vehicleType: 'EV_BIKE',
            vehicleNumber: 'KA-01-TEST-9999',
            isOnline: false,
            rating: 4.9,
          },
        },
      },
      include: { riderProfile: true },
    });

    expect(riderUser).toBeDefined();
    riderToken = generateToken({
      id: riderUser.id,
      name: riderUser.name,
      email: riderUser.email,
      role: riderUser.role,
    });

    // 2. Get a customer user
    customerUser = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
    });
    expect(customerUser).toBeDefined();
    customerToken = generateToken({
      id: customerUser.id,
      name: customerUser.name,
      email: customerUser.email,
      role: customerUser.role,
    });

    // 3. Create a dedicated test order and assignment
    const address = await prisma.address.findFirst();
    const product = await prisma.product.findFirst();

    const secureOtp = crypto.randomInt(1000, 10000).toString();
    testOrder = await prisma.order.create({
      data: {
        orderNumber: `GRO-TEST-RIDER-${Date.now()}`,
        userId: customerUser.id,
        addressId: address!.id,
        subtotal: 350,
        total: 350,
        orderStatus: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        deliveryOtp: secureOtp,
        items: {
          create: [
            {
              productId: product!.id,
              productName: product!.name,
              price: product!.price,
              quantity: 2,
              unit: product!.unit || 'kg',
              total: product!.price * 2,
            },
          ],
        },
        delivery: {
          create: {
            trackingNumber: `TRK-TEST-${Date.now()}`,
            status: 'PENDING',
          },
        },
      },
      include: { delivery: true },
    });

    // Create assignment for rider
    testAssignment = await prisma.riderAssignment.create({
      data: {
        orderId: testOrder.id,
        riderId: riderUser.id,
        status: 'ASSIGNED',
      },
    });
  });

  afterAll(async () => {
    // Cleanup created test records
    if (testAssignment) {
      await prisma.riderEarning.deleteMany({ where: { orderId: testOrder.id } });
      await prisma.deliveryProof.deleteMany({ where: { deliveryId: testOrder.delivery?.id } });
      await prisma.deliveryStatusHistory.deleteMany({ where: { deliveryId: testOrder.delivery?.id } });
      await prisma.riderAssignment.deleteMany({ where: { id: testAssignment.id } });
      await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
      await prisma.delivery.deleteMany({ where: { orderId: testOrder.id } });
      await prisma.order.deleteMany({ where: { id: testOrder.id } });
    }

    if (riderUser) {
      await prisma.riderAvailability.deleteMany({ where: { userId: riderUser.id } });
      await prisma.riderEarning.deleteMany({ where: { riderId: riderUser.id } });
      await prisma.riderProfile.deleteMany({ where: { userId: riderUser.id } });
      await prisma.user.deleteMany({ where: { id: riderUser.id } });
    }
  });

  // Helper to construct mock NextRequest with cookie
  function createAuthedRequest(url: string, method: string, token: string | null, body?: any): NextRequest {
    const headers = new Headers();
    if (body) headers.set('Content-Type', 'application/json');
    if (token) headers.set('cookie', `grovia_session=${token}`);

    return new NextRequest(`http://localhost:3000${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  it('1. GET /api/rider/dashboard returns complete dashboard data for authenticated rider', async () => {
    const req = createAuthedRequest('/api/rider/dashboard', 'GET', riderToken);
    const res = await getDashboard(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.profile).toBeDefined();
    expect(json.profile.name).toBe(riderUser.name);
    expect(json.profile.userId).toBe(riderUser.id);
    expect(json.stats).toBeDefined();
    expect(typeof json.stats.todayEarnings).toBe('number');
    expect(json.pendingAssignments).toBeDefined();
    expect(Array.isArray(json.pendingAssignments)).toBe(true);
  });

  it('2. GET /api/rider/profile and PATCH /api/rider/profile manage rider details', async () => {
    // GET
    const getReq = createAuthedRequest('/api/rider/profile', 'GET', riderToken);
    const getRes = await getProfile(getReq);
    const getJson = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getJson.profile.email).toBe(riderUser.email);

    // PATCH
    const patchReq = createAuthedRequest('/api/rider/profile', 'PATCH', riderToken, {
      emergencyContact: '+91 99999 88888',
      vehicleType: 'EV_BIKE',
    });
    const patchRes = await updateProfile(patchReq);
    const patchJson = await patchRes.json();

    expect(patchRes.status).toBe(200);
    expect(patchJson.profile.emergencyContact).toBe('+91 99999 88888');
  });

  it('3. GET & PATCH /api/rider/availability toggles rider duty online/offline', async () => {
    // Set Online
    const onlineReq = createAuthedRequest('/api/rider/availability', 'PATCH', riderToken, {
      isOnline: true,
      notes: 'Shift started in Indiranagar',
    });
    const onlineRes = await updateAvailability(onlineReq);
    const onlineJson = await onlineRes.json();

    expect(onlineRes.status).toBe(200);
    expect(onlineJson.isOnline).toBe(true);
    expect(onlineJson.status).toBe('IDLE');

    // Verify in database directly
    const dbProfile = await prisma.riderProfile.findUnique({
      where: { userId: riderUser.id },
    });
    expect(dbProfile?.isOnline).toBe(true);

    // GET availability check
    const checkReq = createAuthedRequest('/api/rider/availability', 'GET', riderToken);
    const checkRes = await getAvailability(checkReq);
    const checkJson = await checkRes.json();
    expect(checkRes.status).toBe(200);
    expect(checkJson.isOnline).toBe(true);
    expect(checkJson.history.length).toBeGreaterThan(0);
  });

  it('4. POST /api/rider/orders/[id]/accept accepts assigned task with database transaction', async () => {
    const req = createAuthedRequest(`/api/rider/orders/${testOrder.id}/accept`, 'POST', riderToken);
    const res = await acceptOrder(req, { params: { id: testOrder.id } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('ACCEPTED');

    // Verify in database
    const updatedAssignment = await prisma.riderAssignment.findUnique({
      where: { id: testAssignment.id },
    });
    expect(updatedAssignment?.status).toBe('ACCEPTED');
    expect(updatedAssignment?.acceptedAt).not.toBeNull();

    const updatedOrder = await prisma.order.findUnique({
      where: { id: testOrder.id },
    });
    expect(updatedOrder?.orderStatus).toBe('PROCESSING');
  });

  it('5. PATCH /api/rider/availability prevents going offline when an active delivery is in progress', async () => {
    // Advance status to OUT_FOR_DELIVERY
    await prisma.riderAssignment.update({
      where: { id: testAssignment.id },
      data: { status: 'OUT_FOR_DELIVERY' },
    });

    const offlineReq = createAuthedRequest('/api/rider/availability', 'PATCH', riderToken, {
      isOnline: false,
    });
    const offlineRes = await updateAvailability(offlineReq);
    const offlineJson = await offlineRes.json();

    // Must be rejected with 400!
    expect(offlineRes.status).toBe(400);
    expect(offlineJson.error).toContain('Cannot go offline while you have an active delivery');

    // Verify in database that rider remains online
    const dbProfile = await prisma.riderProfile.findUnique({
      where: { userId: riderUser.id },
    });
    expect(dbProfile?.isOnline).toBe(true);
  });

  it('6. PATCH /api/rider/orders/[id]/status strictly rejects incorrect delivery OTP', async () => {
    const req = createAuthedRequest(`/api/rider/orders/${testOrder.id}/status`, 'PATCH', riderToken, {
      nextStatus: 'DELIVERED',
      otp: '0000', // Invalid OTP
    });
    const res = await patchOrderStatus(req, { params: { id: testOrder.id } });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Invalid Customer Delivery OTP');
  });

  it('7. POST /api/rider/orders/[id]/status completes delivery with correct OTP & logs earnings', async () => {
    const correctOtp = testOrder.deliveryOtp;
    const req = createAuthedRequest(`/api/rider/orders/${testOrder.id}/status`, 'POST', riderToken, {
      nextStatus: 'DELIVERED',
      otp: correctOtp,
      note: 'Handed over directly to customer at doorstep',
    });
    const res = await updateOrderStatus(req, { params: { id: testOrder.id } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('DELIVERED');

    // Check Order and Delivery updated in DB
    const finalOrder = await prisma.order.findUnique({ where: { id: testOrder.id } });
    expect(finalOrder?.orderStatus).toBe('DELIVERED');
    expect(finalOrder?.paymentStatus).toBe('PAID');

    // Check Rider Earnings created in DB
    const earning = await prisma.riderEarning.findFirst({
      where: { riderId: riderUser.id, orderId: testOrder.id },
    });
    expect(earning).toBeDefined();
    expect(earning?.netAmount).toBe(80.0); // 40 base + 15 dist + 15 tip + 10 surge

    // Check AuditLog created
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityId: testOrder.id, action: 'ORDER_DELIVERED_OTP_VERIFIED' },
    });
    expect(auditLog).toBeDefined();
  });

  it('8. GET /api/rider/earnings returns accurate persisted earnings and settlements', async () => {
    const req = createAuthedRequest('/api/rider/earnings', 'GET', riderToken);
    const res = await getEarnings(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.summary).toBeDefined();
    expect(json.summary.totalEarned).toBeGreaterThanOrEqual(80.0);
    expect(json.summary.today).toBeGreaterThanOrEqual(80.0);
    expect(json.earningsList.length).toBeGreaterThan(0);
  });

  it('9. PATCH /api/rider/availability successfully goes offline after active order is completed', async () => {
    const offlineReq = createAuthedRequest('/api/rider/availability', 'PATCH', riderToken, {
      isOnline: false,
    });
    const offlineRes = await updateAvailability(offlineReq);
    const offlineJson = await offlineRes.json();

    expect(offlineRes.status).toBe(200);
    expect(offlineJson.isOnline).toBe(false);
    expect(offlineJson.status).toBe('OFFLINE');

    // Verify offline persistence in database
    const dbProfile = await prisma.riderProfile.findUnique({
      where: { userId: riderUser.id },
    });
    expect(dbProfile?.isOnline).toBe(false);
  });

  it('10. Enforces data isolation and security: rejects customer and unauthenticated requests', async () => {
    // Unauthenticated
    const unauthedReq = createAuthedRequest('/api/rider/dashboard', 'GET', null);
    const unauthedRes = await getDashboard(unauthedReq);
    expect(unauthedRes.status).toBe(401);

    // Customer trying to access rider API
    const custReq = createAuthedRequest('/api/rider/dashboard', 'GET', customerToken);
    const custRes = await getDashboard(custReq);
    expect(custRes.status).toBe(403);
  });
});
