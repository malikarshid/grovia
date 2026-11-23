import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        deliverySlot: true,
        items: true,
        delivery: {
          include: { assignments: true },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Permission check: only admin or the order owner can view
    if (session && !hasAdminRole(session.role) && order.userId !== session.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Staff privileges required.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, deliveryStatus, notes, deliveryPersonName, deliveryPersonPhone } = body;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { delivery: true, items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        notes: notes || undefined,
        paymentStatus: orderStatus === 'DELIVERED' && existing.paymentMethod === 'COD' ? 'PAID' : undefined,
      },
      include: {
        delivery: true,
        items: true,
      },
    });

    // Update Delivery entity
    if (existing.delivery) {
      const delivUpdate: any = {};
      if (deliveryStatus) delivUpdate.status = deliveryStatus;
      if (orderStatus === 'OUT_FOR_DELIVERY') {
        delivUpdate.status = 'OUT_FOR_DELIVERY';
        delivUpdate.departureTime = new Date();
      } else if (orderStatus === 'DELIVERED') {
        delivUpdate.status = 'DELIVERED';
        delivUpdate.deliveredTime = new Date();
      }

      if (deliveryPersonName) delivUpdate.deliveryPersonName = deliveryPersonName;
      if (deliveryPersonPhone) delivUpdate.deliveryPersonPhone = deliveryPersonPhone;

      await prisma.delivery.update({
        where: { id: existing.delivery.id },
        data: delivUpdate,
      });
    }

    // Customer notification
    await prisma.notification.create({
      data: {
        userId: existing.userId,
        title: `Order Status Updated: ${orderStatus || 'Updated'}`,
        message: `Your order #${existing.orderNumber} is now marked as ${orderStatus || 'in progress'}.`,
        type: 'ORDER',
        link: '/orders',
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
