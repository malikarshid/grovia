import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    const where: any = {};
    if (productId) where.productId = productId;
    if (variantId) where.variantId = variantId;

    const offers = await prisma.supplierOffer.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true, company: true, leadTimeDays: true },
        },
        product: {
          select: { id: true, name: true, sku: true },
        },
        variant: {
          select: { id: true, title: true, sku: true },
        },
      },
      orderBy: { sellingPrice: 'asc' },
    });

    return NextResponse.json({ offers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch supplier offers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      supplierId,
      productId,
      variantId,
      supplierPrice,
      procurementCost,
      sellingPrice,
      mrp,
      stockAvailable,
      leadTimeHours,
    } = body;

    if (!supplierId || !productId || sellingPrice === undefined) {
      return NextResponse.json({ error: 'Missing mandatory offer fields' }, { status: 400 });
    }

    // Check existing lowest price for this product/variant
    const existingOffers = await prisma.supplierOffer.findMany({
      where: { productId, variantId: variantId || null },
    });

    const isCheapest = existingOffers.every((o) => parseFloat(sellingPrice) <= o.sellingPrice);

    const offer = await prisma.supplierOffer.create({
      data: {
        supplierId,
        productId,
        variantId: variantId || null,
        supplierPrice: parseFloat(supplierPrice || sellingPrice * 0.85),
        procurementCost: parseFloat(procurementCost || supplierPrice || sellingPrice * 0.85),
        sellingPrice: parseFloat(sellingPrice),
        mrp: parseFloat(mrp || sellingPrice * 1.15),
        stockAvailable: parseInt(stockAvailable || '100', 10),
        leadTimeHours: parseInt(leadTimeHours || '24', 10),
        isCheapest,
      },
    });

    // If new offer is cheapest, mark others as false
    if (isCheapest) {
      await prisma.supplierOffer.updateMany({
        where: {
          productId,
          variantId: variantId || null,
          id: { not: offer.id },
        },
        data: { isCheapest: false },
      });

      // Update product or variant price to match the best offer!
      if (variantId) {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: { price: parseFloat(sellingPrice) },
        });
      } else {
        await prisma.product.update({
          where: { id: productId },
          data: { price: parseFloat(sellingPrice) },
        });
      }
    }

    return NextResponse.json({ success: true, offer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create offer' }, { status: 500 });
  }
}
