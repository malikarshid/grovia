import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const centres = await prisma.fulfilmentCentre.findMany({
      include: {
        _count: {
          select: {
            products: true,
            serviceablePinCodes: true,
            drivers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ centres });
  } catch (error: any) {
    console.error('Fulfilment centres GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fulfilment centres' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, type, address, city, state, pincode, latitude, longitude, deliveryRadiusKm, capacityOrdersPerHour } = body;

    if (!name || !code || !city || !pincode) {
      return NextResponse.json({ error: 'Missing required centre fields' }, { status: 400 });
    }

    const centre = await prisma.fulfilmentCentre.create({
      data: {
        name,
        code,
        type: type || 'DARK_STORE',
        address: address || '',
        city,
        state: state || 'Karnataka',
        pincode,
        latitude: parseFloat(latitude) || 12.9716,
        longitude: parseFloat(longitude) || 77.5946,
        deliveryRadiusKm: parseFloat(deliveryRadiusKm) || 10.0,
        capacityOrdersPerHour: parseInt(capacityOrdersPerHour, 10) || 150,
      },
    });

    return NextResponse.json({ success: true, centre }, { status: 201 });
  } catch (error: any) {
    console.error('Fulfilment centre create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create centre' }, { status: 500 });
  }
}
