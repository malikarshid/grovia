import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.PAYMENT_MODE === 'LIVE') {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventName, payload } = event;

    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderNotes = paymentEntity?.notes || {};
      const orderId = orderNotes.orderId;

      if (orderId) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
            },
          });

          await tx.payment.upsert({
            where: { transactionId: paymentEntity.id },
            create: {
              orderId,
              transactionId: paymentEntity.id,
              provider: 'RAZORPAY_WEBHOOK',
              method: paymentEntity.method || 'ONLINE',
              amount: paymentEntity.amount / 100,
              currency: 'INR',
              status: 'SUCCESS',
            },
            update: {
              status: 'SUCCESS',
            },
          });
        });
      }
    } else if (eventName === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const orderNotes = paymentEntity?.notes || {};
      const orderId = orderNotes.orderId;

      if (orderId) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'FAILED',
            },
          });

          await tx.payment.upsert({
            where: { transactionId: paymentEntity.id },
            create: {
              orderId,
              transactionId: paymentEntity.id,
              provider: 'RAZORPAY_WEBHOOK',
              method: paymentEntity.method || 'ONLINE',
              amount: paymentEntity.amount / 100,
              currency: 'INR',
              status: 'FAILED',
            },
            update: {
              status: 'FAILED',
            },
          });
        });
      }
    }

    return NextResponse.json({ status: 'OK', processed: true });
  } catch (error: any) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
