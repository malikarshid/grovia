import { NextRequest, NextResponse } from 'next/server';
import { CourierService } from '@/services/courierService';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { awb: string } }
) {
  try {
    const { awb } = params;

    // Check if shipment exists in database
    const shipment = await prisma.shipment.findUnique({
      where: { awbCode: awb },
      include: {
        order: {
          include: { address: true },
        },
      },
    });

    const destinationPin = shipment?.destinationPin || shipment?.order?.address?.pincode || '560038';
    const tracking = CourierService.getTrackingTimeline(awb, destinationPin);

    return NextResponse.json({
      success: true,
      shipment: shipment || null,
      tracking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Tracking lookup failed' },
      { status: 500 }
    );
  }
}
