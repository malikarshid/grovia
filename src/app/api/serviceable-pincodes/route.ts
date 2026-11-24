import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const mode = searchParams.get('mode');

    const where: any = {};
    if (search) {
      where.OR = [
        { pincode: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } },
      ];
    }
    if (mode) where.deliveryMode = mode;

    const pinCodes = await prisma.serviceablePinCode.findMany({
      where,
      include: { fulfilmentCentre: true },
      orderBy: { pincode: 'asc' },
    });

    return NextResponse.json({ pinCodes });
  } catch (error: any) {
    console.error('Serviceable pincodes error:', error);
    return NextResponse.json({ error: 'Failed to fetch serviceable PIN codes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { pincode, city, state, district, deliveryMode, estimatedDeliveryMinutes, estimatedDeliveryDays, fulfilmentCentreId } = body;

    if (!pincode || !city || !state) {
      return NextResponse.json({ error: 'Pincode, city and state are required' }, { status: 400 });
    }

    const created = await prisma.serviceablePinCode.upsert({
      where: { pincode },
      update: {
        city,
        state,
        district: district || null,
        deliveryMode: deliveryMode || 'QUICK_LOCAL',
        estimatedDeliveryMinutes: parseInt(estimatedDeliveryMinutes, 10) || 20,
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays, 10) || 0,
        fulfilmentCentreId: fulfilmentCentreId || null,
      },
      create: {
        pincode,
        city,
        state,
        district: district || null,
        deliveryMode: deliveryMode || 'QUICK_LOCAL',
        estimatedDeliveryMinutes: parseInt(estimatedDeliveryMinutes, 10) || 20,
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays, 10) || 0,
        fulfilmentCentreId: fulfilmentCentreId || null,
      },
    });

    return NextResponse.json({ success: true, pinCode: created });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save serviceable pincode' }, { status: 500 });
  }
}
