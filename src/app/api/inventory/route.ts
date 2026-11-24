import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: { category: true },
        },
        supplier: true,
      },
      orderBy: { currentStock: 'asc' },
    });

    return NextResponse.json({ inventory });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
