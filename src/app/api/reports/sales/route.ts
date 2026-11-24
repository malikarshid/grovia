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

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const pendingOrders = orders.filter((o) => ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'CANCELLED').length;

    // Monthly / Weekly sales trend simulation based on real data
    const salesByDay: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[day]) {
        salesByDay[day] = { date: day, revenue: 0, orders: 0 };
      }
      salesByDay[day].orders += 1;
      salesByDay[day].revenue += order.total;
    }

    const salesTrend = Object.values(salesByDay);

    return NextResponse.json({
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      salesTrend,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate sales report' }, { status: 500 });
  }
}
