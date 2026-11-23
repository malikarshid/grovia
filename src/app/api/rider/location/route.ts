import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized rider session' }, { status: 401 });
    }

    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.id },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: 'Rider profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const now = new Date();

    // Update rider current GPS position
    await prisma.riderProfile.update({
      where: { id: riderProfile.id },
      data: {
        currentLatitude: lat,
        currentLongitude: lng,
        lastLocationAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      latitude: lat,
      longitude: lng,
    });
  } catch (error: any) {
    console.error('Rider location telemetry error:', error);
    return NextResponse.json({ error: 'Failed to record GPS telemetry' }, { status: 500 });
  }
}
