import { describe, it, expect } from 'vitest';
import prisma from '@/lib/prisma';

describe('Database Integration Verification', () => {
  it('retrieves seeded categories and verified product associations', async () => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });

    expect(categories.length).toBeGreaterThanOrEqual(10);
    const fruits = categories.find((c) => c.slug === 'fresh-fruits');
    expect(fruits).toBeDefined();
    expect(fruits?._count.products).toBeGreaterThan(0);
  });

  it('verifies product inventory synchronization and stock records', async () => {
    const mango = await prisma.product.findUnique({
      where: { slug: 'ratnagiri-alphonso-mangoes' },
      include: { inventory: true },
    });

    expect(mango).toBeDefined();
    expect(mango?.stock).toBeGreaterThan(0);
    expect(mango?.stock).toBe(mango?.inventory?.currentStock);
    expect(mango?.price).toBe(649);
  });

  it('verifies store settings configuration', async () => {
    const settings = await prisma.storeSettings.findFirst();
    expect(settings).toBeDefined();
    expect(settings?.storeName).toBe('GROVIA');
    expect(settings?.freeDeliveryThreshold).toBe(499);
  });
});
