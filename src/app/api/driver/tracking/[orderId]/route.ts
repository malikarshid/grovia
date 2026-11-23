import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        user: true,
        delivery: true,
        riderAssignments: {
          include: {
            rider: {
              include: {
                riderProfile: true,
              },
            },
          },
        },
        address: true,
        shipment: {
          include: {
            courierProvider: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order has nationwide courier shipment
    if (order.shipment) {
      return NextResponse.json({
        type: 'NATIONWIDE_COURIER',
        orderNumber: order.orderNumber,
        status: order.shipment.status,
        courierName: order.shipment.courierName,
        awbCode: order.shipment.awbCode,
        originPin: order.shipment.originPin,
        destinationPin: order.shipment.destinationPin,
        estimatedArrival: order.shipment.estimatedArrival,
        checkpoints: [
          { status: 'MANIFESTED', title: 'Shipment Manifested & Packed', time: order.createdAt, location: 'Nagpur Central Hub' },
          { status: 'IN_TRANSIT', title: 'In Transit across Surface Network', time: new Date(Date.now() - 3600000 * 12), location: 'Hub Sorting Facility' },
          { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery to Destination', time: null, location: `${order.address.city} Distribution Centre` },
          { status: 'DELIVERED', title: 'Package Delivered', time: null, location: order.address.pincode },
        ],
      });
    }

    // Otherwise, Quick Local Delivery tracking
    // Find active driver or assign default for tracking
    const driver = await prisma.deliveryPartner.findFirst({
      where: { status: { in: ['AVAILABLE', 'ON_THE_WAY', 'PICKING_UP', 'ASSIGNED'] } },
      include: { fulfilmentCentre: true },
    }) || await prisma.deliveryPartner.findFirst({
      include: { fulfilmentCentre: true },
    });

    // Destination coordinates based on address
    const destLat = 12.9784; // Indiranagar default
    const destLng = 77.6408;

    // Source coordinates from dark store or driver
    const currentLat = driver?.currentLatitude || 12.9720;
    const currentLng = driver?.currentLongitude || 77.6350;

    // Resolve assigned rider if present in riderAssignments
    const activeAssignment = order.riderAssignments?.[0];
    const assignedRider = activeAssignment?.rider;
    const riderProfile = assignedRider?.riderProfile;

    const riderObj = assignedRider
      ? {
          name: assignedRider.name,
          phone: assignedRider.phone || '+91 98450 99881',
          vehicleType: riderProfile?.vehicleType || 'Electric Two-Wheeler',
          vehicleNumber: riderProfile?.vehicleNumber || 'DL 04 AB 9682',
          vehicleRegistration: riderProfile?.vehicleNumber || 'DL 04 AB 9682',
          rating: riderProfile?.rating || 4.9,
          currentLocation: {
            latitude: currentLat,
            longitude: currentLng,
          },
        }
      : {
          name: driver?.name || 'Ramesh Kumar',
          phone: driver?.phone || '+91 98450 99881',
          vehicleType: driver?.vehicleType || 'Electric Two-Wheeler',
          vehicleNumber: driver?.vehicleRegistration || 'DL 04 AB 9682',
          vehicleRegistration: driver?.vehicleRegistration || 'DL 04 AB 9682',
          rating: driver?.rating || 4.9,
          currentLocation: {
            latitude: currentLat,
            longitude: currentLng,
          },
        };

    const hubObj = {
      name: driver?.fulfilmentCentre?.name || 'Connaught Place QuickHub',
      address: driver?.fulfilmentCentre?.address || 'Palika Underground Complex, Gate 3, CP, New Delhi 110001',
      code: driver?.fulfilmentCentre?.code || 'DEL-CP-01',
    };

    const currentStage = order.orderStatus === 'DELIVERED'
      ? 'DELIVERED'
      : (order.delivery?.status || (order.orderStatus === 'CONFIRMED' ? 'PROCESSING' : order.orderStatus));

    const customerAddress = order.address
      ? `${order.address.houseNumber || ''} ${order.address.street || ''}, ${order.address.area || ''}, ${order.address.city || ''} ${order.address.pincode || ''}`.trim()
      : 'Customer Delivery Address';

    return NextResponse.json({
      type: order.deliveryMode || 'QUICK_LOCAL',
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      deliveryStatus: order.delivery?.status || 'OUT_FOR_DELIVERY',
      currentStage,
      verificationOtp: order.deliveryOtp || '4921',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        deliveryType: order.deliveryMode === 'NATIONWIDE_COURIER' ? 'EXPRESS' : 'QUICK',
        customerName: order.user?.name || 'Valued Customer',
        shippingAddress: customerAddress,
        total: order.total,
        orderStatus: order.orderStatus,
      },
      rider: riderObj,
      driver: riderObj,
      hub: hubObj,
      destination: {
        address: customerAddress,
        city: order.address?.city || 'Bengaluru',
        pincode: order.address?.pincode || '560038',
        latitude: destLat,
        longitude: destLng,
      },
      fulfilmentCentre: hubObj,
      estimatedDeliveryMinutes: 14,
      liveEtaText: 'Arriving in ~14 mins',
      progressSteps: [
        { label: 'Order Confirmed', completed: true, timestamp: order.createdAt },
        { label: 'Packed at Dark Store', completed: true, timestamp: new Date(Date.now() - 600000) },
        { label: 'Out for Quick Delivery', completed: true, timestamp: new Date(Date.now() - 300000) },
        { label: 'Delivered to Doorstep', completed: order.orderStatus === 'DELIVERED', timestamp: null },
      ],
    });
  } catch (error: any) {
    console.error('Driver tracking error:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
  }
}
