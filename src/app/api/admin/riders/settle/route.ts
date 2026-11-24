import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const { riderId } = body;

    if (!riderId) {
      return NextResponse.json({ error: 'Rider ID is required' }, { status: 400 });
    }

    const riderProfile = await prisma.riderProfile.findFirst({
      where: {
        OR: [{ id: riderId }, { userId: riderId }],
      },
      include: {
        user: {
          include: {
            riderEarnings: {
              where: { status: { not: 'SETTLED' } },
            },
          },
        },
      },
    });

    if (!riderProfile) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    const unsettledEarnings = riderProfile.user.riderEarnings;
    const balance = unsettledEarnings.reduce((acc, e) => acc + e.netAmount, 0);

    if (balance <= 0) {
      return NextResponse.json({ error: 'Rider unsettled balance is ₹0.00. No settlement required.' }, { status: 400 });
    }

    const settlementCode = `STL-2026-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const settlement = await prisma.$transaction(async (tx) => {
      // 1. Create settlement record
      const stl = await tx.riderSettlement.create({
        data: {
          riderId: riderProfile.userId,
          settlementCode,
          periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          periodEnd: now,
          totalTrips: unsettledEarnings.length,
          grossEarnings: balance,
          netPayable: balance,
          status: 'PAID',
          paymentReference: `NEFT-GROVIA-${Date.now().toString().slice(-8)}`,
          paidAt: now,
        },
      });

      // 2. Mark rider earnings as settled
      await tx.riderEarning.updateMany({
        where: {
          riderId: riderProfile.userId,
          status: { not: 'SETTLED' },
        },
        data: {
          status: 'SETTLED',
          settlementId: stl.id,
        },
      });

      return stl;
    });

    return NextResponse.json({
      message: `Settlement of ₹${balance.toFixed(2)} processed successfully for rider`,
      payoutRef: settlement.settlementCode,
      settledAmount: balance,
    });
  } catch (error: any) {
    console.error('Admin settlement error:', error);
    return NextResponse.json({ error: 'Failed to process rider settlement' }, { status: 500 });
  }
}
