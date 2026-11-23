import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findFirst() || {
      storeName: 'GROVIA',
      storeEmail: 'support@grovia.in',
      storePhone: '+91 80 4965 2000',
      storeAddress: 'Grovia HQ, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      businessHours: '06:00 AM - 11:00 PM',
      deliveryFee: 30.0,
      freeDeliveryThreshold: 499.0,
      isDemoPayment: true,
      taxRate: 5.0,
    };
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const existing = await prisma.storeSettings.findFirst();

    const data: any = {
      storeName: body.storeName,
      storeEmail: body.storeEmail,
      storePhone: body.storePhone,
      storeAddress: body.storeAddress,
      businessHours: body.businessHours,
      deliveryFee: body.deliveryFee !== undefined ? Number(body.deliveryFee) : undefined,
      freeDeliveryThreshold: body.freeDeliveryThreshold !== undefined ? Number(body.freeDeliveryThreshold) : undefined,
      taxRate: body.taxRate !== undefined ? Number(body.taxRate) : undefined,
      isDemoPayment: body.isDemoPayment !== undefined ? Boolean(body.isDemoPayment) : undefined,
    };

    let settings;
    if (existing) {
      settings = await prisma.storeSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      settings = await prisma.storeSettings.create({ data });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
