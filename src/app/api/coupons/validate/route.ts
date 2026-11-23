import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired coupon code.' }, { status: 400 });
    }

    if (new Date() > coupon.endDate) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired.' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: 'Coupon usage limit has been reached.' }, { status: 400 });
    }

    const numSubtotal = Number(subtotal || 0);
    if (numSubtotal < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      const raw = (numSubtotal * coupon.discountValue) / 100;
      discount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: Number(discount.toFixed(2)),
      description: coupon.description,
      message: `Coupon ${coupon.code} applied! You saved ₹${discount.toFixed(2)} 🎉`,
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon.' }, { status: 500 });
  }
}
