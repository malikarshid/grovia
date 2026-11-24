import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized rider session. Please log in.' }, { status: 401 });
    }

    if (session.role !== 'RIDER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied. Rider role required.' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { riderProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Rider account not found' }, { status: 404 });
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

    // Fetch all earnings exclusively for this rider (strict data isolation)
    const earnings = await prisma.riderEarning.findMany({
      where: { riderId: session.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let grandTotal = 0;
    let tipTotal = 0;
    let unsettledTotal = 0;
    let basePayTotal = 0;
    let distancePayTotal = 0;
    let surgeBonusTotal = 0;

    for (const e of earnings) {
      grandTotal += e.netAmount;
      tipTotal += e.tipAmount;
      basePayTotal += e.baseFee;
      distancePayTotal += e.distanceFee;
      surgeBonusTotal += e.surgeBonus;

      if (e.status !== 'SETTLED') {
        unsettledTotal += e.netAmount;
      }
      if (e.earnedDate === todayStr) {
        todayTotal += e.netAmount;
      }
      const earnedTime = new Date(e.createdAt);
      if (earnedTime >= startOfWeek) {
        weekTotal += e.netAmount;
      }
      if (earnedTime >= startOfMonth) {
        monthTotal += e.netAmount;
      }
    }

    // Settlements for this rider
    const settlements = await prisma.riderSettlement.findMany({
      where: { riderId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      summary: {
        today: todayTotal,
        thisWeek: weekTotal,
        thisMonth: monthTotal,
        walletBalance: unsettledTotal,
        totalEarned: grandTotal,
        totalTips: tipTotal,
        basePayTotal,
        distancePayTotal,
        surgeBonusTotal,
        totalTrips: riderProfile.totalDeliveries,
      },
      earningsList: earnings.map((e) => ({
        id: e.id,
        orderId: e.orderId,
        orderNumber: e.order?.orderNumber || 'GRO-TRIP',
        baseFee: e.baseFee,
        distancePay: e.distanceFee,
        tip: e.tipAmount,
        bonus: e.surgeBonus,
        deductions: e.deductions,
        total: e.netAmount,
        status: e.status,
        isSettled: e.status === 'SETTLED',
        earnedDate: e.earnedDate,
        createdAt: e.createdAt,
      })),
      settlements: settlements.map((s) => ({
        id: s.id,
        settlementCode: s.settlementCode,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        totalTrips: s.totalTrips,
        grossEarnings: s.grossEarnings,
        deductions: s.deductions,
        netPayable: s.netPayable,
        status: s.status,
        paymentReference: s.paymentReference,
        paidAt: s.paidAt,
      })),
    });
  } catch (error: any) {
    console.error('Rider earnings API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch rider earnings' }, { status: 500 });
  }
}
