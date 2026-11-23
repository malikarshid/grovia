import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const rules = await prisma.deliveryPricingRule.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      minOrderValue,
      standardDeliveryFee,
      freeDeliveryThreshold,
      quickExpressFee,
      smallOrderFee,
      handlingFee,
      isFreeDeliveryCampaign,
      campaignDescription,
      state,
    } = body;

    const rule = await prisma.deliveryPricingRule.create({
      data: {
        name: name || 'Standard Pricing Rule',
        minOrderValue: parseFloat(minOrderValue) || 99.0,
        standardDeliveryFee: parseFloat(standardDeliveryFee) || 99.0,
        freeDeliveryThreshold: parseFloat(freeDeliveryThreshold) || 499.0,
        quickExpressFee: parseFloat(quickExpressFee) || 25.0,
        smallOrderFee: parseFloat(smallOrderFee) || 20.0,
        handlingFee: parseFloat(handlingFee) || 5.0,
        isFreeDeliveryCampaign: Boolean(isFreeDeliveryCampaign),
        campaignDescription: campaignDescription || null,
        state: state || null,
      },
    });

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });

    const updated = await prisma.deliveryPricingRule.update({
      where: { id },
      data: {
        ...data,
        minOrderValue: data.minOrderValue !== undefined ? parseFloat(data.minOrderValue) : undefined,
        standardDeliveryFee: data.standardDeliveryFee !== undefined ? parseFloat(data.standardDeliveryFee) : undefined,
        freeDeliveryThreshold: data.freeDeliveryThreshold !== undefined ? parseFloat(data.freeDeliveryThreshold) : undefined,
        quickExpressFee: data.quickExpressFee !== undefined ? parseFloat(data.quickExpressFee) : undefined,
        smallOrderFee: data.smallOrderFee !== undefined ? parseFloat(data.smallOrderFee) : undefined,
        handlingFee: data.handlingFee !== undefined ? parseFloat(data.handlingFee) : undefined,
      },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update pricing rule' }, { status: 500 });
  }
}
