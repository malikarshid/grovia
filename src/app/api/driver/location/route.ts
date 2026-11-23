import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const drivers = await prisma.deliveryPartner.findMany({
      include: {
        fulfilmentCentre: {
          select: { name: true, code: true, city: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ drivers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch driver fleet' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, orderId, latitude, longitude, speed, status } = body;

    if (!driverId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'driverId, latitude, and longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Update current location on DeliveryPartner
    const driver = await prisma.deliveryPartner.update({
      where: { id: driverId },
      data: {
        currentLatitude: lat,
        currentLongitude: lng,
        lastLocationUpdate: new Date(),
        status: status || undefined,
      },
    });

    // Record breadcrumb in DriverLocation
    const breadcrumb = await prisma.driverLocation.create({
      data: {
        driverId,
        orderId: orderId || null,
        latitude: lat,
        longitude: lng,
        speed: speed ? parseFloat(speed) : null,
      },
    });

    return NextResponse.json({ success: true, driver, breadcrumb });
  } catch (error: any) {
    console.error('Driver location update error:', error);
    return NextResponse.json({ error: 'Failed to record driver location' }, { status: 500 });
  }
}
