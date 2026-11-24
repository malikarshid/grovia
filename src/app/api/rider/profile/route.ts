import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized rider session' }, { status: 401 });
    }

    if (session.role !== 'RIDER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied. Rider role required.' }, { status: 403 });
    }

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
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
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
        include: {
          assignedDarkStore: true,
        },
      });
    }

    return NextResponse.json({
      profile: {
        id: riderProfile.id,
        userId: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        vehicleType: riderProfile.vehicleType,
        vehicleNumber: riderProfile.vehicleNumber,
        drivingLicense: riderProfile.drivingLicense,
        rating: riderProfile.rating,
        totalDeliveries: riderProfile.totalDeliveries,
        onTimeDeliveries: riderProfile.onTimeDeliveries,
        isOnline: riderProfile.isOnline,
        emergencyContact: riderProfile.emergencyContact,
        bankAccountNumber: riderProfile.bankAccountNumber ? '•••• ' + riderProfile.bankAccountNumber.slice(-4) : null,
        bankIfscCode: riderProfile.bankIfscCode,
        isSuspended: user.isSuspended,
        isActive: user.isActive,
        hub: riderProfile.assignedDarkStore ? {
          id: riderProfile.assignedDarkStore.id,
          name: riderProfile.assignedDarkStore.name,
          city: riderProfile.assignedDarkStore.city,
          address: riderProfile.assignedDarkStore.address,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Rider profile GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized rider session' }, { status: 401 });
    }

    const body = await req.json();
    const { emergencyContact, vehicleType, vehicleNumber, phone } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { riderProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    if (phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      });
    }

    const updatedProfile = await prisma.riderProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emergencyContact,
        vehicleType: vehicleType || 'EV_BIKE',
        vehicleNumber: vehicleNumber || 'KA-01-EV-2026',
      },
      update: {
        emergencyContact: emergencyContact !== undefined ? emergencyContact : undefined,
        vehicleType: vehicleType !== undefined ? vehicleType : undefined,
        vehicleNumber: vehicleNumber !== undefined ? vehicleNumber : undefined,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Rider profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
