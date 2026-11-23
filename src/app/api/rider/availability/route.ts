import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

// Helper to resolve & validate rider
async function getValidatedRider(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || !session.id) {
    return { error: 'Unauthorized rider session. Please log in.', status: 401 };
  }

  if (session.role !== 'RIDER' && session.role !== 'SUPER_ADMIN') {
    return { error: 'Access denied. Rider role required.', status: 403 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { riderProfile: true },
  });

  if (!user) {
    return { error: 'Rider account not found', status: 404 };
  }

  if (user.isSuspended || !user.isActive) {
    return { error: 'Your rider account is suspended or inactive. Please contact Fleet Operations.', status: 403 };
  }

  let riderProfile = user.riderProfile;
  if (!riderProfile) {
    riderProfile = await prisma.riderProfile.create({
      data: {
        userId: user.id,
        vehicleType: 'EV_BIKE',
        vehicleNumber: 'KA-01-EV-2026',
        isOnline: false,
        rating: 4.9,
        totalDeliveries: 0,
        onTimeDeliveries: 0,
      },
    });
  }

  return { user, riderProfile };
}

// GET: Return current availability status and recent shift logs
export async function GET(req: NextRequest) {
  try {
    const auth = await getValidatedRider(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, riderProfile } = auth;

    // Fetch shift history for this rider
    const history = await prisma.riderAvailability.findMany({
      where: { userId: user.id },
      orderBy: { sessionStart: 'desc' },
      take: 20,
    });

    // Check if active delivery in progress
    const activeOrder = await prisma.riderAssignment.findFirst({
      where: {
        riderId: user.id,
        status: { in: ['ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'] },
      },
    });

    return NextResponse.json({
      isOnline: riderProfile.isOnline,
      currentStatus: riderProfile.isOnline ? (activeOrder ? 'ON_TRIP' : 'IDLE') : 'OFFLINE',
      hasActiveDelivery: !!activeOrder,
      lastUpdated: riderProfile.updatedAt,
      history,
    });
  } catch (error: any) {
    console.error('Rider availability GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch duty status' }, { status: 500 });
  }
}

// Update availability handler (shared between PATCH and POST)
async function updateAvailability(req: NextRequest) {
  try {
    const auth = await getValidatedRider(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, riderProfile } = auth;
    const body = await req.json();
    const { isOnline, notes } = body;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'isOnline boolean is required (true for online, false for offline)' }, { status: 400 });
    }

    const now = new Date();

    // When going offline: enforce delivery policy
    if (!isOnline) {
      // Check whether an active delivery exists that is in-flight
      const activeDelivery = await prisma.riderAssignment.findFirst({
        where: {
          riderId: user.id,
          status: {
            in: ['ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'],
          },
        },
        include: { order: true },
      });

      if (activeDelivery) {
        return NextResponse.json(
          {
            error: `Cannot go offline while you have an active delivery (${activeDelivery.order.orderNumber}) in progress. Please complete or reassign the order first.`,
          },
          { status: 400 }
        );
      }

      // Close open shift session
      const activeShift = await prisma.riderAvailability.findFirst({
        where: {
          userId: user.id,
          isOnline: true,
          sessionEnd: null,
        },
        orderBy: { sessionStart: 'desc' },
      });

      if (activeShift) {
        await prisma.riderAvailability.update({
          where: { id: activeShift.id },
          data: {
            sessionEnd: now,
            notes: notes || 'Shift ended normally',
          },
        });
      }

      // Persist offline status in database
      const updatedProfile = await prisma.riderProfile.update({
        where: { id: riderProfile.id },
        data: { isOnline: false },
      });

      // Record audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'RIDER_STATUS_OFFLINE',
          entity: 'RiderProfile',
          entityId: riderProfile.id,
          details: JSON.stringify({ userId: user.id, timestamp: now.toISOString(), notes }),
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      return NextResponse.json({
        message: 'Duty status updated to OFFLINE',
        isOnline: false,
        status: 'OFFLINE',
        updatedAt: updatedProfile.updatedAt,
      });
    }

    // When going online:
    // Create new shift session start
    await prisma.riderAvailability.create({
      data: {
        userId: user.id,
        sessionStart: now,
        isOnline: true,
        notes: notes || 'Shift started',
      },
    });

    // Persist online status in database
    const updatedProfile = await prisma.riderProfile.update({
      where: { id: riderProfile.id },
      data: { isOnline: true },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RIDER_STATUS_ONLINE',
        entity: 'RiderProfile',
        entityId: riderProfile.id,
        details: JSON.stringify({ userId: user.id, timestamp: now.toISOString(), notes }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({
      message: 'Duty status updated to ONLINE',
      isOnline: true,
      status: 'IDLE',
      updatedAt: updatedProfile.updatedAt,
    });
  } catch (error: any) {
    console.error('Rider availability update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update duty availability' }, { status: 500 });
  }
}

// Support both PATCH and POST
export async function PATCH(req: NextRequest) {
  return updateAvailability(req);
}

export async function POST(req: NextRequest) {
  return updateAvailability(req);
}
