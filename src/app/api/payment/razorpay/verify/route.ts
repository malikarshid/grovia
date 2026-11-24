import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment signature verification parameters' },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic HMAC signature
    const isValid = PaymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // 2. Lookup order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Idempotency: Check if payment already recorded
    const existingPayment = order.payments.find(
      (p) => p.transactionId === razorpayPaymentId
    );

    if (existingPayment && existingPayment.status === 'SUCCESS') {
      return NextResponse.json({
        message: 'Payment already verified and recorded',
        orderId: order.id,
        status: 'PAID',
      });
    }

    // 4. Update order & payment record in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
        },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId: razorpayPaymentId,
          provider: 'RAZORPAY',
          method: 'ONLINE',
          amount: order.total,
          currency: 'INR',
          status: 'SUCCESS',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: order.userId,
          action: 'PAYMENT_VERIFIED',
          entity: 'Order',
          entityId: order.id,
          details: JSON.stringify({
            razorpayOrderId,
            razorpayPaymentId,
            amount: order.total,
          }),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and confirmed successfully',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'PAID',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment signature verification error' },
      { status: 500 }
    );
  }
}
