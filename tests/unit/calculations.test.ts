import { describe, it, expect } from 'vitest';
import { calculateTotals, calculateDiscount, formatCurrency } from '@/lib/utils';

describe('Financial and Cart Calculation Logic', () => {
  it('calculates discount percentage correctly', () => {
    expect(calculateDiscount(189, 220)).toBe(14);
    expect(calculateDiscount(649, 799)).toBe(19);
    expect(calculateDiscount(100, 100)).toBe(0);
    expect(calculateDiscount(150, 100)).toBe(0);
    expect(calculateDiscount(100, null)).toBe(0);
  });

  it('formats Indian Rupee currency correctly', () => {
    expect(formatCurrency(499)).toContain('499');
    expect(formatCurrency(499)).toContain('₹');
    expect(formatCurrency(0)).toContain('0');
    expect(formatCurrency(1250.5)).toContain('1,250.50');
  });

  it('calculates order totals below free delivery threshold with delivery fee and 5% GST', () => {
    const items = [
      { price: 100, quantity: 2 }, // ₹200
    ];
    const totals = calculateTotals({
      items,
      couponDiscount: 0,
      deliveryFee: 30,
      freeDeliveryThreshold: 499,
      taxRate: 5.0,
    });

    expect(totals.subtotal).toBe(200);
    expect(totals.discount).toBe(0);
    expect(totals.deliveryFee).toBe(30);
    expect(totals.tax).toBe(10); // 5% of 200 = 10
    expect(totals.total).toBe(240); // 200 + 30 + 10 = 240
    expect(totals.freeDeliveryRemaining).toBe(299);
  });

  it('waives delivery fee when subtotal exceeds free delivery threshold (₹499)', () => {
    const items = [
      { price: 649, quantity: 1 }, // Ratnagiri Alphonso Mangoes ₹649
    ];
    const totals = calculateTotals({
      items,
      couponDiscount: 100, // GROVIA100 applied
      deliveryFee: 30,
      freeDeliveryThreshold: 499,
      taxRate: 5.0,
    });

    expect(totals.subtotal).toBe(649);
    expect(totals.discount).toBe(100);
    const taxable = 549; // 649 - 100 = 549, which is >= 499, so delivery is free!
    expect(totals.deliveryFee).toBe(0);
    expect(totals.tax).toBe(27.45); // 5% of 549
    expect(totals.total).toBe(576.45); // 549 + 0 + 27.45
    expect(totals.freeDeliveryRemaining).toBe(0);
  });
});
