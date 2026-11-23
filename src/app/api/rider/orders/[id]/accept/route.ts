import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized rider session' }, { status: 401 });
    }

    if (session.role !== 'RIDER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied. Rider privileges required.' }, { status: 403 });
    }

    const { id } = params;

    // Find assignment by ID or Order ID belonging to this rider
    const assignment = await prisma.riderAssignment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        riderId: session.id,
      },
      include: {
        order: {
          include: { delivery: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Order assignment not found for this rider' }, { status: 404 });
    }

    if (assignment.status === 'ACCEPTED') {
      return NextResponse.json({
        message: 'Order already accepted',
        assignment,
      });
    }

    if (assignment.status !== 'ASSIGNED') {
      return NextResponse.json(
        { error: `Cannot accept assignment in current state: ${assignment.status}` },
        { status: 400 }
      );
    }

    const now = new Date();

    // Use transaction to ensure ACID compliance
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update assignment to ACCEPTED
      const updatedAssignment = await tx.riderAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: now,
        },
      });

      // 2. Update Order status
      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          orderStatus: 'PROCESSING',
        },
      });

      // 3. Update Delivery status & history if delivery exists
      if (assignment.order.delivery) {
        await tx.delivery.update({
          where: { id: assignment.order.delivery.id },
          data: {
            status: 'ACCEPTED',
          },
        });

        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: assignment.order.delivery.id,
            status: 'ACCEPTED',
            notes: 'Delivery accepted by rider',
            updatedBy: session.id,
          },
        });
      }

      // 4. Log audit log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'RIDER_ORDER_ACCEPTED',
          entity: 'Order',
          entityId: assignment.orderId,
          details: JSON.stringify({
            riderId: session.id,
            assignmentId: assignment.id,
            acceptedAt: now.toISOString(),
          }),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      return updatedAssignment;
    });

    return NextResponse.json({
      message: 'Order accepted successfully',
      status: 'ACCEPTED',
      assignment: result,
    });
  } catch (error: any) {
    console.error('Accept order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to accept order' }, { status: 500 });
  }
}
