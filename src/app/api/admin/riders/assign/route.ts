import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, riderId } = body;

    if (!orderId || !riderId) {
      return NextResponse.json({ error: 'Both orderId and riderId are required' }, { status: 400 });
    }

    // Check order and rider
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const riderProfile = await prisma.riderProfile.findFirst({
      where: {
        OR: [{ id: riderId }, { userId: riderId }],
      },
      include: { user: true },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    const targetUserId = riderProfile.userId;

    // Create assignment & update delivery
    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.riderAssignment.create({
        data: {
          orderId,
          riderId: targetUserId,
          status: 'ASSIGNED',
        },
      });

      if (order.delivery) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            riderId: targetUserId,
            deliveryPersonName: riderProfile.user.name,
            deliveryPersonPhone: riderProfile.user.phone,
            status: 'ASSIGNED',
          },
        });

        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: order.delivery.id,
            status: 'ASSIGNED',
            notes: 'Order manually dispatched to rider by administration',
          },
        });
      }

      await tx.riderProfile.update({
        where: { id: riderProfile.id },
        data: { isOnline: true },
      });

      return assignment;
    });

    return NextResponse.json({
      message: 'Order dispatched to rider successfully',
      assignment: result,
    });
  } catch (error: any) {
    console.error('Dispatch assignment error:', error);
    return NextResponse.json({ error: 'Failed to dispatch order' }, { status: 500 });
  }
}
