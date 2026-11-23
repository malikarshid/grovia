import { describe, it, expect } from 'vitest';
import { hasAdminRole, generateToken, verifyToken } from '@/lib/auth';

describe('Authentication and RBAC Security Verification', () => {
  it('correctly recognizes privileged administrative roles', () => {
    expect(hasAdminRole('SUPER_ADMIN')).toBe(true);
    expect(hasAdminRole('ADMIN')).toBe(true);
    expect(hasAdminRole('INVENTORY_MGR')).toBe(true);
    expect(hasAdminRole('ORDER_MGR')).toBe(true);
    expect(hasAdminRole('DELIVERY_MGR')).toBe(true);
    expect(hasAdminRole('CUSTOMER')).toBe(false);
    expect(hasAdminRole('GUEST')).toBe(false);
  });

  it('generates and decodes secure JWT user session tokens', () => {
    const payload: any = {
      id: 'usr_test_123',
      name: 'Vikramaditya Rao',
      email: 'admin@grovia.in',
      role: 'SUPER_ADMIN',
    };

    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe('admin@grovia.in');
    expect(decoded?.role).toBe('SUPER_ADMIN');
  });
});
