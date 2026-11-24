import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const riders = await prisma.riderProfile.findMany({
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
            riderAssignments: true,
            riderEarnings: true,
          },
        },
        assignedDarkStore: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedRiders = riders.map((r) => {
      const unsettledEarnings = r.user.riderEarnings
        .filter((e) => e.status !== 'SETTLED')
        .reduce((sum, e) => sum + e.netAmount, 0);

      return {
        id: r.id,
        userId: r.userId,
        vehicleType: r.vehicleType,
        vehicleNumber: r.vehicleNumber,
        drivingLicense: r.drivingLicense,
        rating: r.rating,
        totalDeliveries: r.totalDeliveries,
        onTimeDeliveries: r.onTimeDeliveries,
        isOnline: r.isOnline,
        walletBalance: unsettledEarnings,
        currentStatus: r.isOnline ? 'IDLE' : 'OFFLINE',
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          phone: r.user.phone,
          username: r.user.username,
          isSuspended: r.user.isSuspended,
          isActive: r.user.isActive,
          lastLoginAt: r.user.lastLoginAt,
        },
        hub: r.assignedDarkStore,
      };
    });

    return NextResponse.json({ riders: formattedRiders });
  } catch (error: any) {
    console.error('Admin riders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch riders list' }, { status: 500 });
  }
}
