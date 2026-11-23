import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        category: true,
        department: true,
        brand: true,
        images: true,
        variants: {
          orderBy: { price: 'asc' },
        },
        supplierOffers: {
          include: {
            supplier: {
              select: { id: true, name: true, company: true, leadTimeDays: true },
            },
          },
          orderBy: { sellingPrice: 'asc' },
        },
        fulfilmentCentreProducts: {
          include: {
            fulfilmentCentre: {
              select: { id: true, name: true, code: true, type: true, city: true },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        inventory: {
          include: { supplier: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Also fetch related products from same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
    });

    return NextResponse.json({ product, related });
  } catch (error: any) {
    console.error('Product details GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
        unit: body.unit !== undefined ? body.unit : undefined,
        weight: body.weight !== undefined ? Number(body.weight) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        minStock: body.minStock !== undefined ? Number(body.minStock) : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        description: body.description !== undefined ? body.description : undefined,
        image: body.image !== undefined ? body.image : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
      },
    });

    // Update inventory if stock changed
    if (body.stock !== undefined && body.stock !== existing.stock) {
      const diff = body.stock - existing.stock;
      await prisma.inventory.upsert({
        where: { productId: id },
        update: {
          currentStock: body.stock,
          status: body.stock <= 0 ? 'OUT_OF_STOCK' : body.stock <= existing.minStock ? 'LOW_STOCK' : 'IN_STOCK',
        },
        create: {
          productId: id,
          currentStock: body.stock,
          minThreshold: existing.minStock,
          status: body.stock <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
        },
      });

      await prisma.stockMovement.create({
        data: {
          productId: id,
          type: diff > 0 ? 'IN' : 'ADJUSTMENT',
          quantity: Math.abs(diff),
          previousStock: existing.stock,
          newStock: body.stock,
          reason: body.stockReason || 'Manual inventory update by staff',
          createdBy: session.name,
        },
      });
    }

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    // Soft delete/archive to preserve past orders consistency
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Product archived successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
