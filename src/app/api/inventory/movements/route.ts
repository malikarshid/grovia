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

    const movements = await prisma.stockMovement.findMany({
      include: {
        product: { select: { name: true, sku: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ movements });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 });
  }
}
