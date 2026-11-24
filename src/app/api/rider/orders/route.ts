import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized rider session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    let statusCondition: any = undefined;
    if (filter === 'active') {
      statusCondition = {
        in: ['ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'],
      };
    } else if (filter === 'delivered') {
      statusCondition = 'DELIVERED';
    }

    const assignments = await prisma.riderAssignment.findMany({
      where: {
        riderId: session.id,
        ...(statusCondition ? { status: statusCondition } : {}),
      },
      include: {
        order: {
          include: {
            items: true,
            delivery: true,
            address: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: 50,
    });

    const orders = assignments.map((a) => ({
      assignmentId: a.id,
      assignmentStatus: a.status,
      assignedAt: a.assignedAt,
      deliveredAt: a.deliveredAt,
      orderId: a.order.id,
      orderNumber: a.order.orderNumber,
      orderStatus: a.order.orderStatus,
      deliveryType: a.order.deliveryMode === 'QUICK_LOCAL' ? 'QUICK' : 'STANDARD',
      customerName: a.order.address?.fullName || 'Customer',
      customerPhone: a.order.address?.phone || '',
      shippingAddress: a.order.address
        ? `${a.order.address.houseNumber}, ${a.order.address.street}, ${a.order.address.area}, ${a.order.address.city} - ${a.order.address.pincode}`
        : 'Address on file',
      totalAmount: a.order.total,
      itemCount: a.order.items.length,
      paymentMethod: a.order.paymentMethod,
      paymentStatus: a.order.paymentStatus,
      deliveryOtp: a.order.deliveryOtp,
    }));

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Rider orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch rider orders' }, { status: 500 });
  }
}
