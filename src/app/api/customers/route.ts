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

    const where: any = { role: 'CUSTOMER' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        customerProfile: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          select: { total: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformed = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || 'N/A',
      totalOrders: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
      loyaltyPoints: c.customerProfile?.loyaltyPoints || 0,
      isActive: c.isActive,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ customers: transformed });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
