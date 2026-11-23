import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
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

    const assignment = await prisma.riderAssignment.findFirst({
      where: {
        OR: [
          { id: id },
          { orderId: id },
        ],
        ...(session.role === 'SUPER_ADMIN' ? {} : { riderId: session.id }),
      },
      include: {
        order: {
          include: {
            items: true,
            delivery: {
              include: {
                statusHistory: {
                  orderBy: { timestamp: 'desc' },
                },
                proof: true,
              },
            },
            address: true,
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            riderProfile: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment or order not found' }, { status: 404 });
    }

    // Retrieve Hub
    const hub = assignment.rider?.riderProfile?.assignedDarkStoreId
      ? await prisma.fulfilmentCentre.findUnique({
          where: { id: assignment.rider.riderProfile.assignedDarkStoreId },
        })
      : null;

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        acceptedAt: assignment.acceptedAt,
        pickedUpAt: assignment.pickedUpAt,
        deliveredAt: assignment.deliveredAt,
      },
      order: {
        id: assignment.order.id,
        orderNumber: assignment.order.orderNumber,
        status: assignment.order.orderStatus,
        customerName: assignment.order.address?.fullName || 'Customer',
        customerPhone: assignment.order.address?.phone || '',
        customerEmail: '',
        shippingAddress: assignment.order.address
          ? `${assignment.order.address.houseNumber}, ${assignment.order.address.street}, ${assignment.order.address.area}, ${assignment.order.address.city} - ${assignment.order.address.pincode}`
          : 'Address on file',
        deliverySlot: assignment.order.notes,
        deliveryNotes: assignment.order.notes,
        totalAmount: assignment.order.total,
        subtotal: assignment.order.subtotal,
        deliveryFee: assignment.order.deliveryFee,
        discount: assignment.order.discount,
        paymentMethod: assignment.order.paymentMethod,
        paymentStatus: assignment.order.paymentStatus,
        items: assignment.order.items,
        delivery: {
          ...assignment.order.delivery,
          requiresOtp: true, // Rider knows OTP is required at doorstep, but NEVER sees the secret OTP!
        },
        hub: hub ? {
          name: hub.name,
          address: hub.address,
        } : null,
      },
      rider: assignment.rider,
    });
  } catch (error: any) {
    console.error('Rider order detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
