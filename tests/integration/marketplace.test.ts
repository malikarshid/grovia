import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '@/lib/prisma';

describe('GROVIA India-Wide Marketplace & Multi-Store Logistics Integration Tests', () => {
  it('1. Verifies 30 marketplace departments are initialized with slugs and active status', async () => {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    expect(departments.length).toBeGreaterThanOrEqual(30);

    const slugs = departments.map((d) => d.slug);
    expect(slugs).toContain('fruits-vegetables');
    expect(slugs).toContain('dairy-bread-eggs');
    expect(slugs).toContain('atta-rice-dal');
    expect(slugs).toContain('regional-indian-foods');
    expect(slugs).toContain('pooja-essentials');
  });

  it('2. Verifies national brands are linked to products and categories', async () => {
    const brands = await prisma.brand.findMany();
    expect(brands.length).toBeGreaterThanOrEqual(10);

    const brandNames = brands.map((b) => b.name);
    expect(brandNames).toContain('Amul');
    expect(brandNames).toContain('Aashirvaad');
    expect(brandNames).toContain('Tata Sampann');
    expect(brandNames).toContain("Haldiram's");
  });

  it('3. Verifies product variants are linked without duplicating base products', async () => {
    const aashirvaad = await prisma.product.findUnique({
      where: { slug: 'aashirvaad-shudh-chakki-atta' },
      include: { variants: true },
    });

    expect(aashirvaad).toBeDefined();
    expect(aashirvaad?.variants.length).toBeGreaterThanOrEqual(2);

    const variantSkus = aashirvaad?.variants.map((v) => v.sku);
    expect(variantSkus).toContain('AASH-SHAR-1KG');
    expect(variantSkus).toContain('AASH-SHAR-5KG');

    // Variant prices scale logically
    const v1kg = aashirvaad?.variants.find((v) => v.sku === 'AASH-SHAR-1KG');
    const v5kg = aashirvaad?.variants.find((v) => v.sku === 'AASH-SHAR-5KG');
    expect(v1kg?.price).toBeLessThan(v5kg?.price || 0);
  });

  it('4. Verifies multi-supplier offers and cheapest offer detection', async () => {
    const aashirvaad = await prisma.product.findUnique({
      where: { slug: 'aashirvaad-shudh-chakki-atta' },
    });

    if (aashirvaad) {
      const offers = await prisma.supplierOffer.findMany({
        where: { productId: aashirvaad.id },
        include: { supplier: true },
        orderBy: { sellingPrice: 'asc' },
      });

      expect(offers.length).toBeGreaterThanOrEqual(2);
      const cheapestOffer = offers.find((o) => o.isCheapest);
      expect(cheapestOffer).toBeDefined();
      expect(cheapestOffer?.sellingPrice).toBeLessThanOrEqual(offers[offers.length - 1].sellingPrice);
    }
  });

  it('5. Verifies fulfilment centres (dark stores & warehouses) are configured', async () => {
    const centres = await prisma.fulfilmentCentre.findMany({
      where: { isActive: true },
    });

    expect(centres.length).toBeGreaterThanOrEqual(5);

    const types = centres.map((c) => c.type);
    expect(types).toContain('DARK_STORE');
    expect(types).toContain('WAREHOUSE');

    const blrDarkStore = centres.find((c) => c.code === 'BLR-IND-01');
    expect(blrDarkStore).toBeDefined();
    expect(blrDarkStore?.deliveryRadiusKm).toBeGreaterThan(0);
    expect(blrDarkStore?.capacityOrdersPerHour).toBeGreaterThanOrEqual(100);
  });

  it('6. Verifies serviceable PIN codes routing (QUICK_LOCAL vs NATIONWIDE)', async () => {
    const blrPin = await prisma.serviceablePinCode.findUnique({
      where: { pincode: '560038' },
      include: { fulfilmentCentre: true },
    });

    expect(blrPin).toBeDefined();
    expect(blrPin?.deliveryMode).toBe('QUICK_LOCAL');
    expect(blrPin?.estimatedDeliveryMinutes).toBeLessThanOrEqual(30);
    expect(blrPin?.fulfilmentCentre).toBeDefined();

    const punePin = await prisma.serviceablePinCode.findUnique({
      where: { pincode: '411001' },
    });

    expect(punePin).toBeDefined();
    expect(punePin?.deliveryMode).toBe('NATIONWIDE');
    expect(punePin?.estimatedDeliveryDays).toBeGreaterThanOrEqual(1);
  });

  it('7. Verifies active delivery pricing rules and threshold calculations', async () => {
    const pricingRule = await prisma.deliveryPricingRule.findFirst({
      where: { isActive: true },
    });

    expect(pricingRule).toBeDefined();
    expect(pricingRule?.minOrderValue).toBe(99);
    expect(pricingRule?.standardDeliveryFee).toBe(99);
    expect(pricingRule?.freeDeliveryThreshold).toBe(499);
    expect(pricingRule?.quickExpressFee).toBe(25);
    expect(pricingRule?.isFreeDeliveryCampaign).toBe(true);
  });

  it('8. Verifies delivery fleet partners are equipped with GPS coordinates', async () => {
    const drivers = await prisma.deliveryPartner.findMany({
      where: { status: { not: 'OFFLINE' } },
    });

    expect(drivers.length).toBeGreaterThanOrEqual(3);
    for (const driver of drivers) {
      expect(driver.currentLatitude).toBeDefined();
      expect(driver.currentLongitude).toBeDefined();
      expect(driver.rating).toBeGreaterThanOrEqual(4.0);
    }
  });
});
