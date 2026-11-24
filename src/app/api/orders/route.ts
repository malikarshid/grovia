import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';
import { calculateTotals } from '@/lib/utils';
import { PaymentService } from '@/services/paymentService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const isAdmin = hasAdminRole(session.role);

    const where: any = {};
    if (!isAdmin) {
      where.userId = session.id;
    } else {
      if (status && status !== 'ALL') {
        where.orderStatus = status;
      }
      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ];
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        deliverySlot: true,
        items: true,
        delivery: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();

    const {
      items,
      addressId,
      addressData, // fallback if guest or newly added address
      deliverySlotId,
      paymentMethod = 'COD',
      couponCode,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // Determine user
    let userId = session?.id;
    if (!userId) {
      // Find or create guest user
      const guestEmail = addressData?.email || 'guest@grovia.in';
      let guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: addressData?.fullName || 'Guest Shopper',
            email: guestEmail,
            passwordHash: 'guest_no_login',
            role: 'CUSTOMER',
          },
        });
      }
      userId = guestUser.id;
    }

    // Determine address
    let finalAddressId = addressId;
    if (!finalAddressId && addressData) {
      const createdAddr = await prisma.address.create({
        data: {
          userId,
          fullName: addressData.fullName,
          phone: addressData.phone,
          houseNumber: addressData.houseNumber,
          street: addressData.street,
          area: addressData.area,
          city: addressData.city || 'Bengaluru',
          state: addressData.state || 'Karnataka',
          pincode: addressData.pincode,
          instructions: addressData.instructions || null,
        },
      });
      finalAddressId = createdAddr.id;
    }

    if (!finalAddressId) {
      return NextResponse.json({ error: 'Valid delivery address is required.' }, { status: 400 });
    }

    // Fetch store settings for delivery fee & thresholds
    const settings = await prisma.storeSettings.findFirst() || {
      deliveryFee: 30,
      freeDeliveryThreshold: 499,
      taxRate: 5.0,
    };

    // Use Prisma transaction to verify stock and process order safely
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current product records and verify stock
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let calculatedSubtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const dbProduct = productMap.get(item.productId);
        if (!dbProduct) {
          throw new Error(`Product ${item.productId} was not found.`);
        }
        if (dbProduct.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} available.`);
        }

        const lineTotal = Number((dbProduct.price * item.quantity).toFixed(2));
        calculatedSubtotal += lineTotal;

        orderItemsToCreate.push({
          productId: dbProduct.id,
          productName: dbProduct.name,
          unit: dbProduct.unit,
          price: dbProduct.price,
          quantity: item.quantity,
          total: lineTotal,
        });

        // Decrement stock
        const newStock = dbProduct.stock - item.quantity;
        await tx.product.update({
          where: { id: dbProduct.id },
          data: { stock: newStock },
        });

        // Update inventory record
        await tx.inventory.updateMany({
          where: { productId: dbProduct.id },
          data: {
            currentStock: newStock,
            status: newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= dbProduct.minStock ? 'LOW_STOCK' : 'IN_STOCK',
          },
        });

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: dbProduct.id,
            type: 'OUT',
            quantity: item.quantity,
            previousStock: dbProduct.stock,
            newStock: newStock,
            reason: 'Order placed by customer',
            createdBy: session?.name || 'Customer',
          },
        });
      }

      // 2. Validate Coupon if supplied
      let couponDiscount = 0;
      let validCouponId: string | null = null;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });

        if (coupon && coupon.isActive && new Date() <= coupon.endDate && calculatedSubtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'PERCENTAGE') {
            const rawDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
            couponDiscount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
          } else {
            couponDiscount = coupon.discountValue;
          }
          validCouponId = coupon.id;

          // Increment usage count
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      // 3. Recalculate totals on server
      const totals = calculateTotals({
        items: orderItemsToCreate.map((i) => ({ price: i.price, quantity: i.quantity })),
        couponDiscount,
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        taxRate: settings.taxRate,
      });

      // 4. Generate order number & cryptographically secure 4-digit delivery OTP
      const orderNumber = `GRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const deliveryOtp = crypto.randomInt(1000, 10000).toString();

      // 5. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: finalAddressId,
          deliverySlotId: deliverySlotId || null,
          subtotal: totals.subtotal,
          discount: totals.discount,
          deliveryFee: totals.deliveryFee,
          tax: totals.tax,
          total: totals.total,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          orderStatus: 'CONFIRMED',
          channel: 'WEB',
          notes: notes || null,
          deliveryOtp: deliveryOtp,
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      // 6. Record Coupon usage
      if (validCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: validCouponId,
            userId,
            orderId: newOrder.id,
            discountAmount: totals.discount,
          },
        });
      }

      // 7. Process payment via service
      const paymentResult = await PaymentService.processPayment({
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        amount: totals.total,
        currency: 'INR',
        method: paymentMethod as any,
        customer: {
          name: session?.name || addressData?.fullName || 'Customer',
          email: session?.email || addressData?.email || 'customer@grovia.in',
          phone: session?.phone || addressData?.phone || '+91 98000 00000',
        },
      });

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          transactionId: paymentResult.transactionId,
          provider: paymentResult.provider,
          method: paymentMethod,
          amount: totals.total,
          currency: 'INR',
          status: paymentResult.status,
        },
      });

      // 8. Create Delivery record with tracking number
      const trackingNumber = `TRK-BLR-${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          trackingNumber,
          status: 'PENDING',
          notes: 'Order confirmed and ready for packaging.',
        },
      });

      // If destination PIN code is nationwide, create a Shipment record for AWB courier tracking
      const destAddr = await tx.address.findUnique({ where: { id: finalAddressId } });
      if (destAddr?.pincode) {
        const pinRecord = await tx.serviceablePinCode.findUnique({ where: { pincode: destAddr.pincode } });
        if (pinRecord && pinRecord.deliveryMode === 'NATIONWIDE') {
          await tx.shipment.create({
            data: {
              orderId: newOrder.id,
              awbCode: `AWB-DLV-${destAddr.pincode}-${Math.floor(1000 + Math.random() * 9000)}`,
              courierName: 'Delhivery Surface Express',
              originPin: '441108',
              destinationPin: destAddr.pincode,
              status: 'MANIFESTED',
              estimatedArrival: new Date(Date.now() + 86400000 * (pinRecord.estimatedDeliveryDays || 3)),
            },
          });
        }
      }

      // 9. Create in-app customer notification
      await tx.notification.create({
        data: {
          userId,
          title: `Order Confirmed: #${orderNumber}`,
          message: `Your grocery order of ₹${totals.total.toFixed(2)} has been confirmed!`,
          type: 'ORDER',
          link: `/orders`,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      message: 'Order created successfully',
      order: result,
      orderNumber: result.orderNumber,
      orderId: result.id,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order.' },
      { status: 400 }
    );
  }
}
