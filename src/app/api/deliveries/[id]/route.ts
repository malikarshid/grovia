import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, deliveryPersonName, deliveryPersonPhone, notes } = body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === 'OUT_FOR_DELIVERY') data.departureTime = new Date();
      if (status === 'DELIVERED') data.deliveredTime = new Date();
    }
    if (deliveryPersonName) data.deliveryPersonName = deliveryPersonName;
    if (deliveryPersonPhone) data.deliveryPersonPhone = deliveryPersonPhone;
    if (notes) data.notes = notes;

    const updated = await prisma.delivery.update({
      where: { id },
      data,
      include: { order: true },
    });

    // Sync orderStatus with delivery status if applicable
    if (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: {
          orderStatus: status,
          paymentStatus: status === 'DELIVERED' && updated.order.paymentMethod === 'COD' ? 'PAID' : undefined,
        },
      });
    }

    return NextResponse.json({ delivery: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
  }
}
