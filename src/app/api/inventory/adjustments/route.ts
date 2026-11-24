import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { productId, adjustmentType, quantity, reason } = body;

    if (!productId || !adjustmentType || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Product, type, and valid quantity required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let newStock = product.stock;
    if (adjustmentType === 'ADD' || adjustmentType === 'RESTOCK') {
      newStock += Number(quantity);
    } else if (adjustmentType === 'REDUCE' || adjustmentType === 'DAMAGE') {
      newStock = Math.max(0, newStock - Number(quantity));
    } else if (adjustmentType === 'SET') {
      newStock = Number(quantity);
    }

    // Transaction for stock and inventory sync
    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      prisma.inventory.upsert({
        where: { productId },
        update: {
          currentStock: newStock,
          status: newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= product.minStock ? 'LOW_STOCK' : 'IN_STOCK',
        },
        create: {
          productId,
          currentStock: newStock,
          minThreshold: product.minStock,
          status: newStock <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
        },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          type: adjustmentType,
          quantity: Number(quantity),
          previousStock: product.stock,
          newStock,
          reason: reason || 'Inventory adjustment by staff',
          createdBy: session.name,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Stock updated successfully',
      previousStock: product.stock,
      newStock,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to adjust stock' }, { status: 500 });
  }
}
