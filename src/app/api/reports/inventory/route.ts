import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        category: { select: { name: true } },
      },
    });

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    const items = products.map((p) => {
      let status = 'In Stock';
      if (p.stock <= 0) {
        status = 'Out of Stock';
        outOfStock++;
      } else if (p.stock <= p.minStock) {
        status = 'Low Stock';
        lowStock++;
      } else {
        inStock++;
      }

      return {
        id: p.id,
        name: p.name,
        category: p.category.name,
        stock: p.stock,
        minStock: p.minStock,
        status,
      };
    });

    return NextResponse.json({
      summary: {
        totalProducts: products.length,
        inStock,
        lowStock,
        outOfStock,
      },
      stockLevels: items.slice(0, 10), // Top 10 for charts
      items,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate inventory report' }, { status: 500 });
  }
}
