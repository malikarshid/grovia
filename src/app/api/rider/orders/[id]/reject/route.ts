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
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const { reason = 'Rider declined delivery assignment' } = body;

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

    // Only allow rejection if still in ASSIGNED or ACCEPTED state (before pickup)
    if (['PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER', 'DELIVERED'].includes(assignment.status)) {
      return NextResponse.json(
        { error: 'Cannot decline order after products have been picked up from the store. Please contact Dispatch Support.' },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update assignment to REJECTED
      const updatedAssignment = await tx.riderAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });

      // 2. Reset order status to CONFIRMED for redispatch
      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          orderStatus: 'CONFIRMED',
        },
      });

      // 3. Reset delivery if present
      if (assignment.order.delivery) {
        await tx.delivery.update({
          where: { id: assignment.order.delivery.id },
          data: {
            status: 'PENDING',
          },
        });

        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: assignment.order.delivery.id,
            status: 'REJECTED',
            notes: `Rider declined assignment: ${reason}`,
            updatedBy: session.id,
          },
        });
      }

      // 4. Log audit log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'RIDER_ORDER_DECLINED',
          entity: 'Order',
          entityId: assignment.orderId,
          details: JSON.stringify({
            riderId: session.id,
            assignmentId: assignment.id,
            reason,
            timestamp: now.toISOString(),
          }),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      return updatedAssignment;
    });

    return NextResponse.json({
      message: 'Order assignment declined',
      status: 'REJECTED',
      assignment: result,
    });
  } catch (error: any) {
    console.error('Reject order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to decline order' }, { status: 500 });
  }
}
