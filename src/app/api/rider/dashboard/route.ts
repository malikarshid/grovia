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

    // Role check: Only RIDER or SUPER_ADMIN can access rider dashboard
    if (session.role !== 'RIDER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied. Rider role required.' }, { status: 403 });
    }

    // Lookup user in DB to check active/suspension status
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        riderProfile: {
          include: {
            assignedDarkStore: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Rider account not found' }, { status: 404 });
    }

    if (user.isSuspended || !user.isActive) {
      return NextResponse.json(
        { error: 'Your rider account is suspended or inactive. Please contact Fleet Operations.' },
        { status: 403 }
      );
    }

    // Auto-provision rider profile if missing for this user
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
        include: {
          assignedDarkStore: true,
        },
      });
    }

    // Active assigned order (in-progress)
    const activeAssignment = await prisma.riderAssignment.findFirst({
      where: {
        riderId: session.id,
        status: {
          in: ['ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER'],
        },
      },
      include: {
        order: {
          include: {
            items: true,
            delivery: true,
            address: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Pending assignments specifically awaiting rider action (status == 'ASSIGNED')
    const pendingAssignments = await prisma.riderAssignment.findMany({
      where: {
        riderId: session.id,
        status: 'ASSIGNED',
      },
      include: {
        order: {
          include: {
            items: true,
            address: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Today's earnings
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEarnings = await prisma.riderEarning.findMany({
      where: {
        riderId: session.id,
        earnedDate: todayStr,
      },
    });

    const todayEarningsSum = todayEarnings.reduce((acc, curr) => acc + curr.netAmount, 0);
    const todayTripsCount = todayEarnings.length;

    // All unsettled earnings for wallet balance
    const allUnsettled = await prisma.riderEarning.findMany({
      where: {
        riderId: session.id,
        status: { not: 'SETTLED' },
      },
    });
    const walletBalance = allUnsettled.reduce((acc, curr) => acc + curr.netAmount, 0);

    const hub = riderProfile.assignedDarkStore;

    // Format active order payload
    const activeOrderData = activeAssignment ? {
      assignmentId: activeAssignment.id,
      assignmentStatus: activeAssignment.status,
      orderId: activeAssignment.order.id,
      orderNumber: activeAssignment.order.orderNumber,
      deliveryType: activeAssignment.order.deliveryMode === 'QUICK_LOCAL' ? 'QUICK' : 'STANDARD',
      paymentStatus: activeAssignment.order.paymentStatus,
      paymentMethod: activeAssignment.order.paymentMethod,
      totalAmount: activeAssignment.order.total,
      customerName: activeAssignment.order.address?.fullName || 'Valued Customer',
      customerPhone: activeAssignment.order.address?.phone || '',
      shippingAddress: activeAssignment.order.address
        ? `${activeAssignment.order.address.houseNumber || ''} ${activeAssignment.order.address.street || ''}, ${activeAssignment.order.address.area || ''}, ${activeAssignment.order.address.city || ''} - ${activeAssignment.order.address.pincode || ''}`.trim()
        : 'Address details on file',
      deliverySlot: activeAssignment.order.notes,
      itemsCount: activeAssignment.order.items.length,
      items: activeAssignment.order.items,
      deliveryNotes: activeAssignment.order.notes,
      verificationOtp: activeAssignment.order.deliveryOtp || '4921',
      hub: hub ? {
        name: hub.name,
        address: hub.address,
        phone: '+91 80 4965 2000',
      } : {
        name: 'Connaught Place QuickHub',
        address: 'Palika Underground Complex, Gate 3, CP, New Delhi 110001',
        phone: '+91 80 4965 2000',
      },
    } : null;

    return NextResponse.json({
      profile: {
        id: riderProfile.id,
        userId: riderProfile.userId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        vehicleType: riderProfile.vehicleType,
        vehicleNumber: riderProfile.vehicleNumber,
        currentStatus: riderProfile.isOnline ? (activeAssignment ? 'ON_TRIP' : 'IDLE') : 'OFFLINE',
        rating: riderProfile.rating,
        totalTrips: riderProfile.totalDeliveries,
        acceptanceRate: 98,
        onTimeRate: 99,
        walletBalance: walletBalance,
        isOnline: riderProfile.isOnline,
        isSuspended: user.isSuspended,
        hub: hub ? {
          id: hub.id,
          name: hub.name,
          city: hub.city,
          address: hub.address,
        } : null,
      },
      stats: {
        todayEarnings: todayEarningsSum,
        todayTrips: todayTripsCount,
        rating: riderProfile.rating,
        acceptanceRate: 98,
        walletBalance: walletBalance,
        totalCompletedDeliveries: riderProfile.totalDeliveries,
      },
      activeOrder: activeOrderData,
      pendingAssignments: pendingAssignments.map((p) => ({
        assignmentId: p.id,
        orderId: p.order.id,
        orderNumber: p.order.orderNumber,
        totalAmount: p.order.total,
        customerName: p.order.address?.fullName || 'Customer',
        shippingAddress: p.order.address
          ? `${p.order.address.houseNumber || ''} ${p.order.address.street || ''}, ${p.order.address.city || ''}`.trim()
          : 'Address on file',
        itemsCount: p.order.items.length,
        assignedAt: p.assignedAt,
      })),
    });
  } catch (error: any) {
    console.error('Rider dashboard error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
