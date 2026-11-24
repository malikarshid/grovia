import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const riderProfile = await prisma.riderProfile.findFirst({
      where: {
        OR: [
          { id: params.id },
          { userId: params.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            username: true,
            isSuspended: true,
            isActive: true,
            lastLoginAt: true,
            riderAssignments: {
              include: {
                order: true,
              },
              orderBy: { assignedAt: 'desc' },
              take: 20,
            },
            riderEarnings: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
            riderSettlements: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        assignedDarkStore: true,
      },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    const unsettledBalance = riderProfile.user.riderEarnings
      .filter((e) => e.status !== 'SETTLED')
      .reduce((sum, e) => sum + e.netAmount, 0);

    return NextResponse.json({
      rider: {
        id: riderProfile.id,
        userId: riderProfile.userId,
        vehicleType: riderProfile.vehicleType,
        vehicleNumber: riderProfile.vehicleNumber,
        licenseNumber: riderProfile.drivingLicense,
        rating: riderProfile.rating,
        totalTrips: riderProfile.totalDeliveries,
        acceptanceRate: 98,
        onTimeRate: 99,
        walletBalance: unsettledBalance,
        currentStatus: riderProfile.isOnline ? 'IDLE' : 'OFFLINE',
        user: {
          id: riderProfile.user.id,
          name: riderProfile.user.name,
          email: riderProfile.user.email,
          phone: riderProfile.user.phone,
          username: riderProfile.user.username,
          isSuspended: riderProfile.user.isSuspended,
          isActive: riderProfile.user.isActive,
          lastLoginAt: riderProfile.user.lastLoginAt,
        },
        hub: riderProfile.assignedDarkStore,
        assignments: riderProfile.user.riderAssignments,
        earnings: riderProfile.user.riderEarnings,
        settlements: riderProfile.user.riderSettlements,
      },
    });
  } catch (error: any) {
    console.error('Admin rider detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch rider profile' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const { isSuspended } = body;

    const rider = await prisma.riderProfile.findFirst({
      where: {
        OR: [{ id: params.id }, { userId: params.id }],
      },
    });

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: rider.userId },
      data: { isSuspended: !!isSuspended },
    });

    return NextResponse.json({
      message: `Rider account ${isSuspended ? 'suspended' : 'reactivated'} successfully`,
      isSuspended: !!isSuspended,
    });
  } catch (error: any) {
    console.error('Admin rider status update error:', error);
    return NextResponse.json({ error: 'Failed to update rider status' }, { status: 500 });
  }
}
