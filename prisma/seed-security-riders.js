const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSecurityAndRiders() {
  console.log('🔒 Seeding GROVIA Security, Admin Credentials & Rider Portal...');

  const adminLoginId = process.env.ADMIN_LOGIN_ID || 'admin_me';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || '9682pw';

  const riderLoginId = process.env.RIDER_LOGIN_ID || 'rider_me';
  const riderPassword = process.env.RIDER_INITIAL_PASSWORD || 'Rider@9682pw';

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedRiderPassword = await bcrypt.hash(riderPassword, 10);

  // 1. Seed or update initial administrator
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { username: adminLoginId },
        { email: 'admin@grovia.in' },
      ],
    },
  });

  let adminUser;
  if (!existingAdmin) {
    adminUser = await prisma.user.create({
      data: {
        name: 'Vikramaditya Rao (System Admin)',
        username: adminLoginId,
        email: 'admin@grovia.in',
        phone: '+91 98765 43210',
        passwordHash: hashedAdminPassword,
        role: 'SUPER_ADMIN',
        mustChangePassword: true,
        isActive: true,
      },
    });
    console.log(`✅ Administrator ${adminLoginId} created with mustChangePassword flag.`);
  } else {
    adminUser = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        username: adminLoginId,
        passwordHash: hashedAdminPassword,
        mustChangePassword: true,
      },
    });
    console.log(`ℹ️ Existing administrator ${adminUser.email} preserved with username ${adminLoginId}.`);
  }

  // 2. Seed or update initial delivery rider
  const existingRider = await prisma.user.findFirst({
    where: {
      OR: [
        { username: riderLoginId },
        { email: 'rider_me@grovia.in' },
      ],
    },
  });

  const blrDarkStore = await prisma.fulfilmentCentre.findFirst({
    where: { code: 'BLR-IND-01' },
  });

  let riderUser;
  if (!existingRider) {
    riderUser = await prisma.user.create({
      data: {
        name: 'Ramesh Gowda',
        username: riderLoginId,
        email: 'rider_me@grovia.in',
        phone: '+91 98450 77112',
        passwordHash: hashedRiderPassword,
        role: 'RIDER',
        mustChangePassword: true,
        isActive: true,
      },
    });
    console.log(`✅ Delivery Rider ${riderLoginId} created with mustChangePassword flag.`);
  } else {
    riderUser = await prisma.user.update({
      where: { id: existingRider.id },
      data: {
        username: riderLoginId,
        role: 'RIDER',
      },
    });
    console.log(`ℹ️ Existing delivery rider preserved with username ${riderLoginId}.`);
  }

  // 3. Upsert RiderProfile
  const riderProfile = await prisma.riderProfile.upsert({
    where: { userId: riderUser.id },
    update: {
      vehicleType: 'EV_BIKE',
      vehicleNumber: 'KA-01-EV-9682',
      isOnline: true,
      currentLatitude: 12.9789,
      currentLongitude: 77.6415,
      lastLocationAt: new Date(),
      assignedDarkStoreId: blrDarkStore ? blrDarkStore.id : null,
    },
    create: {
      userId: riderUser.id,
      vehicleType: 'EV_BIKE',
      vehicleNumber: 'KA-01-EV-9682',
      drivingLicense: 'KA-01-20220019283',
      rating: 4.9,
      totalDeliveries: 128,
      onTimeDeliveries: 124,
      isOnline: true,
      currentLatitude: 12.9789,
      currentLongitude: 77.6415,
      lastLocationAt: new Date(),
      emergencyContact: '+91 98450 00099',
      assignedDarkStoreId: blrDarkStore ? blrDarkStore.id : null,
    },
  });
  console.log(`✅ RiderProfile configured for ${riderUser.name}.`);

  // 4. Assign an active sample order to rider
  const sampleOrder = await prisma.order.findFirst({
    where: { orderStatus: { in: ['CONFIRMED', 'OUT_FOR_DELIVERY', 'PROCESSING'] } },
    include: { delivery: true, address: true },
  });

  if (sampleOrder) {
    // Update delivery with riderId
    if (sampleOrder.delivery) {
      await prisma.delivery.update({
        where: { id: sampleOrder.delivery.id },
        data: {
          riderId: riderUser.id,
          deliveryPersonName: riderUser.name,
          deliveryPersonPhone: riderUser.phone,
          status: 'OUT_FOR_DELIVERY',
        },
      });

      // Add status history
      await prisma.deliveryStatusHistory.create({
        data: {
          deliveryId: sampleOrder.delivery.id,
          status: 'OUT_FOR_DELIVERY',
          latitude: 12.9789,
          longitude: 77.6415,
          notes: 'Package picked up from dark store. Out for delivery.',
          updatedBy: riderUser.id,
        },
      });

      // Upsert route
      await prisma.deliveryRoute.upsert({
        where: { deliveryId: sampleOrder.delivery.id },
        update: {},
        create: {
          deliveryId: sampleOrder.delivery.id,
          pickupLat: blrDarkStore?.latitude || 12.9784,
          pickupLng: blrDarkStore?.longitude || 77.6408,
          dropoffLat: sampleOrder.address?.latitude || 12.9716,
          dropoffLng: sampleOrder.address?.longitude || 77.5946,
          distanceKm: 3.2,
          estimatedMinutes: 14,
        },
      });

      // Upsert proof record with 4-digit OTP
      await prisma.deliveryProof.upsert({
        where: { deliveryId: sampleOrder.delivery.id },
        update: {},
        create: {
          deliveryId: sampleOrder.delivery.id,
          otpCode: sampleOrder.deliveryOtp || '4921',
          otpVerified: false,
        },
      });
    }

    // Upsert RiderAssignment
    await prisma.riderAssignment.upsert({
      where: { id: `asgn-${sampleOrder.id}` },
      update: {},
      create: {
        id: `asgn-${sampleOrder.id}`,
        orderId: sampleOrder.id,
        riderId: riderUser.id,
        status: 'OUT_FOR_DELIVERY',
        acceptedAt: new Date(Date.now() - 15 * 60 * 1000),
        pickedUpAt: new Date(Date.now() - 5 * 60 * 1000),
        notes: 'Cold chain dairy items secured in thermal pouch.',
      },
    });

    // Upsert sample earnings for today and this week
    const todayStr = new Date().toISOString().slice(0, 10);
    await prisma.riderEarning.create({
      data: {
        riderId: riderUser.id,
        orderId: sampleOrder.id,
        baseFee: 40.0,
        distanceFee: 18.0,
        surgeBonus: 10.0,
        tipAmount: 20.0,
        deductions: 0.0,
        netAmount: 88.0,
        status: 'PENDING',
        earnedDate: todayStr,
      },
    });

    console.log(`✅ Sample active order #${sampleOrder.orderNumber} assigned to ${riderUser.name}.`);
  }

  // 5. Audit Log for security provisioning
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SECURITY_SEED',
      entity: 'SystemSecurity',
      entityId: 'admin_rider_credentials',
      details: `Initialized administrator (${adminLoginId}) and dedicated rider (${riderLoginId}) credentials securely.`,
    },
  });

  console.log('🎉 Security and Rider Portal seeding completed successfully!');
}

seedSecurityAndRiders()
  .catch((e) => {
    console.error('❌ Error during security seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
