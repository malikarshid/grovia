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
      select: { channel: true, orderStatus: true, total: true },
    });

    // Channel breakdown (Doughnut chart data)
    const channelCounts: Record<string, number> = { WEB: 0, MOBILE: 0, INSTORE: 0 };
    orders.forEach((o) => {
      const ch = o.channel || 'WEB';
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    });

    const total = orders.length || 1;
    const orderSources = [
      { name: 'Website Orders', count: channelCounts['WEB'] || 0, percent: Math.round(((channelCounts['WEB'] || 0) / total) * 100), color: '#2E7D32' },
      { name: 'Mobile App Orders', count: channelCounts['MOBILE'] || 0, percent: Math.round(((channelCounts['MOBILE'] || 0) / total) * 100), color: '#FF6F00' },
      { name: 'In-Store Pickup', count: channelCounts['INSTORE'] || 0, percent: Math.round(((channelCounts['INSTORE'] || 0) / total) * 100), color: '#0288D1' },
    ];

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
    });

    return NextResponse.json({
      totalOrders: orders.length,
      orderSources,
      statusCounts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate order sources report' }, { status: 500 });
  }
}
