import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!hasAdminRole(session.role) && order.userId !== session.id) {
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
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, deliveryStatus, notes, deliveryPersonName, deliveryPersonPhone, cancellationReason } = body;

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { delivery: true, items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdmin = hasAdminRole(session.role);
    const isOwner = existing.userId === session.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied. You do not have permission to modify this order.' }, { status: 403 });
    }

    // Customer cancellation rules
    if (!isAdmin && isOwner) {
      if (orderStatus !== 'CANCELLED') {
        return NextResponse.json({ error: 'Customers can only request order cancellation.' }, { status: 403 });
      }
      if (existing.orderStatus !== 'PENDING' && existing.orderStatus !== 'CONFIRMED') {
        return NextResponse.json(
          { error: `Order cannot be cancelled in current status: ${existing.orderStatus}. Items are already packed or in transit.` },
          { status: 400 }
        );
      }
    }

    // If order is being cancelled (by admin or owner), restore stock atomically in a transaction
    if (orderStatus === 'CANCELLED' && existing.orderStatus !== 'CANCELLED') {
      const updated = await prisma.$transaction(async (tx) => {
        // 1. Restore product stock and inventory
        for (const item of existing.items) {
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          const prevStock = prod ? prod.stock : 0;
          const restoredStock = prevStock + item.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: restoredStock },
          });

          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              currentStock: restoredStock,
              status: 'IN_STOCK',
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              previousStock: prevStock,
              newStock: restoredStock,
              reason: `Order #${existing.orderNumber} cancelled - stock restored`,
              createdBy: session.name || 'System',
            },
          });
        }

        // 2. Update order status and refund if prepaid
        const isPrepaid = existing.paymentStatus === 'PAID';
        const updatedOrder = await tx.order.update({
          where: { id: existing.id },
          data: {
            orderStatus: 'CANCELLED',
            paymentStatus: isPrepaid ? 'REFUNDED' : existing.paymentStatus,
            notes: cancellationReason || notes || existing.notes,
          },
          include: {
            delivery: true,
            items: true,
          },
        });

        // 3. Update delivery status
        if (existing.delivery) {
          await tx.delivery.update({
            where: { id: existing.delivery.id },
            data: { status: 'FAILED' },
          });
        }

        // 4. Log audit log
        await tx.auditLog.create({
          data: {
            userId: session.id,
            action: 'ORDER_CANCELLED_STOCK_RESTORED',
            entity: 'Order',
            entityId: existing.id,
            details: JSON.stringify({
              orderNumber: existing.orderNumber,
              cancelledBy: session.role,
              reason: cancellationReason || 'Order cancelled',
              itemsRestored: existing.items.length,
            }),
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          },
        });

        return updatedOrder;
      });

      return NextResponse.json({ order: updated, message: 'Order cancelled and inventory restored successfully.' });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
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
