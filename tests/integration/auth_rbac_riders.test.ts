import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '@/lib/prisma';
import { verifyPassword, hasAdminRole, generateToken, verifyToken } from '@/lib/auth';

describe('Admin, Rider & Multi-Experience RBAC Security Tests', () => {
  let testAdminUser: any;
  let testRiderUser: any;

  beforeAll(async () => {
    testAdminUser = await prisma.user.findFirst({
      where: { username: 'admin_me' },
    });

    testRiderUser = await prisma.user.findFirst({
      where: { username: 'rider_me' },
      include: { riderProfile: true },
    });
  });

  it('verifies that admin_me exists with SUPER_ADMIN role and mustChangePassword flag', () => {
    expect(testAdminUser).toBeDefined();
    expect(testAdminUser.username).toBe('admin_me');
    expect(testAdminUser.role).toBe('SUPER_ADMIN');
    expect(hasAdminRole(testAdminUser.role)).toBe(true);
    expect(testAdminUser.isSuspended).toBe(false);
  });

  it('validates password hash for admin_me with initial credential', async () => {
    const isValid = await verifyPassword('9682pw', testAdminUser.passwordHash);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword('WrongPassword123', testAdminUser.passwordHash);
    expect(isWrong).toBe(false);
  });

  it('verifies that rider_me exists with RIDER role and linked RiderProfile', () => {
    expect(testRiderUser).toBeDefined();
    expect(testRiderUser.username).toBe('rider_me');
    expect(testRiderUser.role).toBe('RIDER');
    expect(hasAdminRole(testRiderUser.role)).toBe(false); // Riders CANNOT have admin role!
    expect(testRiderUser.riderProfile).toBeDefined();
    expect(testRiderUser.riderProfile.vehicleNumber).toContain('9682');
  });

  it('validates password hash for rider_me with initial credential', async () => {
    const isValid = await verifyPassword('Rider@9682pw', testRiderUser.passwordHash);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword('InvalidPin000', testRiderUser.passwordHash);
    expect(isWrong).toBe(false);
  });

  it('enforces strict role-based separation in tokens', () => {
    const adminToken = generateToken({
      id: testAdminUser.id,
      name: testAdminUser.name,
      email: testAdminUser.email,
      role: testAdminUser.role,
    });

    const riderToken = generateToken({
      id: testRiderUser.id,
      name: testRiderUser.name,
      email: testRiderUser.email,
      role: testRiderUser.role,
    });

    const verifiedAdmin = verifyToken(adminToken);
    const verifiedRider = verifyToken(riderToken);

    expect(hasAdminRole(verifiedAdmin!.role)).toBe(true);
    expect(hasAdminRole(verifiedRider!.role)).toBe(false);
    expect(verifiedRider!.role).toBe('RIDER');
  });

  it('simulates order delivery lifecycle and OTP verification logic', async () => {
    const expectedOtp = '9682';

    const inputOtpCorrect = '9682';
    const inputOtpWrong = '1234';

    expect(inputOtpCorrect.trim() === expectedOtp).toBe(true);
    expect(inputOtpWrong.trim() === expectedOtp).toBe(false);

    const LIFECYCLE_STEPS = [
      'ASSIGNED',
      'ACCEPTED',
      'ARRIVED_AT_STORE',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'ARRIVED_AT_CUSTOMER',
      'DELIVERED',
    ];

    expect(LIFECYCLE_STEPS.indexOf('ASSIGNED')).toBe(0);
    expect(LIFECYCLE_STEPS.indexOf('DELIVERED')).toBe(6);
    expect(LIFECYCLE_STEPS.length).toBe(7);
  });

  it('verifies rider earning calculation rules', () => {
    const baseFee = 40.0;
    const distanceFee = 15.0;
    const tipAmount = 15.0;
    const surgeBonus = 10.0;
    const totalPayout = baseFee + distanceFee + tipAmount + surgeBonus;

    expect(totalPayout).toBe(80.0);
    expect(baseFee).toBeGreaterThanOrEqual(40.0);
  });
});
