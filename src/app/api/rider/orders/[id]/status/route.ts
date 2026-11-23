import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

const LIFECYCLE_STEPS = [
  'ASSIGNED',
  'ACCEPTED',
  'ARRIVED_AT_STORE',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'ARRIVED_AT_CUSTOMER',
  'DELIVERED',
];

async function handleStatusUpdate(
  req: NextRequest,
  params: { id: string }
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
    const body = await req.json();
    const { nextStatus, status, otp, reason, note, latitude, longitude } = body;
    const targetStatus = nextStatus || status;

    if (!targetStatus) {
      return NextResponse.json({ error: 'Target status (nextStatus or status) is required' }, { status: 400 });
    }

    // Find assignment belonging to this rider or order
    const assignment = await prisma.riderAssignment.findFirst({
      where: {
        OR: [
          { id: id },
          { orderId: id },
        ],
        riderId: session.id,
      },
      include: {
        order: {
          include: {
            delivery: true,
            address: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Order assignment not found for this rider' }, { status: 404 });
    }

    // Prevent duplicate delivery completion and duplicate earnings
    if (assignment.status === 'DELIVERED') {
      return NextResponse.json({
        message: 'Order has already been completed and delivered',
        assignment,
        status: 'DELIVERED',
      });
    }

    // Handle Cancellation / Rejection
    if (targetStatus === 'REJECTED' || targetStatus === 'CANCELLED') {
      await prisma.riderAssignment.update({
        where: { id: assignment.id },
        data: {
          status: targetStatus,
          rejectionReason: reason || 'Rider declined assignment',
        },
      });

      return NextResponse.json({
        message: `Order assignment marked as ${targetStatus}`,
        status: targetStatus,
      });
    }

    // Validate lifecycle sequence
    const targetIndex = LIFECYCLE_STEPS.indexOf(targetStatus);
    if (targetIndex === -1) {
      return NextResponse.json({ error: `Invalid status: ${targetStatus}` }, { status: 400 });
    }

    // If attempting to deliver, require strict OTP verification against order delivery OTP
    if (targetStatus === 'DELIVERED') {
      const expectedOtp = assignment.order.deliveryOtp;
      if (!expectedOtp || !otp || String(otp).trim() !== String(expectedOtp).trim()) {
        return NextResponse.json(
          { error: 'Invalid Customer Delivery OTP. Please ask customer for the correct 4-digit verification code.' },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const updateData: any = { status: targetStatus };
    if (targetStatus === 'ACCEPTED' && !assignment.acceptedAt) updateData.acceptedAt = now;
    if (targetStatus === 'PICKED_UP' && !assignment.pickedUpAt) updateData.pickedUpAt = now;
    if (targetStatus === 'DELIVERED' && !assignment.deliveredAt) updateData.deliveredAt = now;

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Rider Assignment
      const updatedAssignment = await tx.riderAssignment.update({
        where: { id: assignment.id },
        data: updateData,
      });

      // 2. Map assignment status to Order / Delivery status
      let orderStatus: any = assignment.order.orderStatus;
      let deliveryStatus: any = assignment.order.delivery?.status || 'PENDING';

      if (targetStatus === 'ACCEPTED') {
        orderStatus = 'PROCESSING';
        deliveryStatus = 'ACCEPTED';
      } else if (targetStatus === 'ARRIVED_AT_STORE') {
        orderStatus = 'PROCESSING';
        deliveryStatus = 'ARRIVED_AT_STORE';
      } else if (targetStatus === 'PICKED_UP') {
        orderStatus = 'PACKED';
        deliveryStatus = 'PICKED_UP';
      } else if (targetStatus === 'OUT_FOR_DELIVERY') {
        orderStatus = 'OUT_FOR_DELIVERY';
        deliveryStatus = 'OUT_FOR_DELIVERY';
      } else if (targetStatus === 'ARRIVED_AT_CUSTOMER') {
        orderStatus = 'OUT_FOR_DELIVERY';
        deliveryStatus = 'ARRIVED_AT_CUSTOMER';
      } else if (targetStatus === 'DELIVERED') {
        orderStatus = 'DELIVERED';
        deliveryStatus = 'DELIVERED';
      }

      // Update Order
      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          orderStatus: orderStatus,
          paymentStatus: targetStatus === 'DELIVERED' && assignment.order.paymentMethod === 'COD'
            ? 'PAID'
            : assignment.order.paymentStatus,
        },
      });

      // Update or create Delivery
      if (assignment.order.delivery) {
        await tx.delivery.update({
          where: { id: assignment.order.delivery.id },
          data: {
            status: deliveryStatus,
            deliveredTime: targetStatus === 'DELIVERED' ? now : assignment.order.delivery.deliveredTime,
          },
        });

        // Add to Delivery Status History
        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: assignment.order.delivery.id,
            status: targetStatus,
            notes: note || `Delivery transitioned to ${targetStatus}`,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            updatedBy: session.id,
          },
        });

        // If DELIVERED, upsert DeliveryProof
        if (targetStatus === 'DELIVERED') {
          await tx.deliveryProof.upsert({
            where: { deliveryId: assignment.order.delivery.id },
            create: {
              deliveryId: assignment.order.delivery.id,
              recipientName: assignment.order.address?.fullName || 'Customer',
              otpVerified: true,
              otpCode: String(otp),
            },
            update: {
              otpVerified: true,
              otpCode: String(otp),
              confirmedAt: now,
            },
          });
        }
      }

      // 3. If DELIVERED, record Rider Earnings & update RiderProfile deliveries
      if (targetStatus === 'DELIVERED') {
        const baseFee = 40.0;
        const distanceFee = 15.0;
        const tipAmount = 15.0;
        const surgeBonus = 10.0;
        const totalPay = baseFee + distanceFee + tipAmount + surgeBonus;

        const earnedDate = now.toISOString().split('T')[0];

        // Check if earning already recorded for this order
        const existingEarning = await tx.riderEarning.findFirst({
          where: {
            riderId: assignment.riderId,
            orderId: assignment.orderId,
          },
        });

        if (!existingEarning) {
          await tx.riderEarning.create({
            data: {
              riderId: assignment.riderId,
              orderId: assignment.orderId,
              baseFee,
              distanceFee,
              tipAmount,
              surgeBonus,
              netAmount: totalPay,
              earnedDate,
              status: 'PENDING',
            },
          });
        }

        const profile = await tx.riderProfile.findUnique({
          where: { userId: assignment.riderId },
        });

        if (profile) {
          await tx.riderProfile.update({
            where: { id: profile.id },
            data: {
              totalDeliveries: { increment: 1 },
              onTimeDeliveries: { increment: 1 },
            },
          });
        }

        // 4. Log audit record for delivery completion
        await tx.auditLog.create({
          data: {
            userId: session.id,
            action: 'ORDER_DELIVERED_OTP_VERIFIED',
            entity: 'Order',
            entityId: assignment.orderId,
            details: JSON.stringify({
              riderId: session.id,
              orderId: assignment.orderId,
              verifiedAt: now.toISOString(),
            }),
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          },
        });
      }

      return updatedAssignment;
    });

    return NextResponse.json({
      message: `Status updated to ${targetStatus} successfully`,
      assignment: result,
      status: targetStatus,
    });
  } catch (error: any) {
    console.error('Update status API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleStatusUpdate(req, params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleStatusUpdate(req, params);
}
