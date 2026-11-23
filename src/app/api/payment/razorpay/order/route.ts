import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { getSessionFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const { orderId, amount } = body;

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid orderId and positive amount are required' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session && order.userId !== session.id && session.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Access denied to this order' }, { status: 403 });
    }

    // Generate Razorpay Order
    const razorpayOrder = await PaymentService.createRazorpayOrder({
      amount,
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
      isLive: razorpayOrder.isLive,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment gateway order' },
      { status: 500 }
    );
  }
}
