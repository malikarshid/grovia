import { describe, it, expect } from 'vitest';

describe('Coupon Validation Logic', () => {
  const sampleCoupons = [
    {
      code: 'GROVIA100',
      discountType: 'FIXED',
      discountValue: 100,
      minOrderAmount: 500,
      maxDiscount: 100,
      endDate: new Date('2026-12-31'),
      isActive: true,
      usageLimit: 500,
      usedCount: 10,
    },
    {
      code: 'FRESH15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 399,
      maxDiscount: 150,
      endDate: new Date('2026-12-31'),
      isActive: true,
      usageLimit: 200,
      usedCount: 200, // Max reached
    },
    {
      code: 'EXPIRED10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 100,
      endDate: new Date('2024-01-01'), // Expired
      isActive: true,
      usageLimit: 100,
      usedCount: 5,
    },
  ];

  function validateCoupon(code: string, subtotal: number) {
    const coupon = sampleCoupons.find((c) => c.code === code);
    if (!coupon || !coupon.isActive) return { valid: false, error: 'Invalid coupon' };
    if (new Date() > coupon.endDate) return { valid: false, error: 'Expired coupon' };
    if (coupon.usedCount >= coupon.usageLimit) return { valid: false, error: 'Usage limit reached' };
    if (subtotal < coupon.minOrderAmount) return { valid: false, error: 'Min order amount not met' };

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      const raw = (subtotal * coupon.discountValue) / 100;
      discount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    } else {
      discount = coupon.discountValue;
    }

    return { valid: true, discount };
  }

  it('validates a valid coupon with qualifying subtotal', () => {
    const result = validateCoupon('GROVIA100', 650);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(100);
  });

  it('rejects coupon when order subtotal is below minimum threshold', () => {
    const result = validateCoupon('GROVIA100', 350);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Min order amount not met');
  });

  it('rejects coupon when usage limit is reached', () => {
    const result = validateCoupon('FRESH15', 500);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Usage limit reached');
  });

  it('rejects expired coupons', () => {
    const result = validateCoupon('EXPIRED10', 300);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Expired coupon');
  });
});
