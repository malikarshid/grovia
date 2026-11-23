import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, houseNumber, street, area, city, state, pincode, instructions, isDefault } = body;

    if (!fullName || !phone || !houseNumber || !pincode) {
      return NextResponse.json({ error: 'Missing mandatory address fields' }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.id,
        fullName,
        phone,
        houseNumber,
        street: street || '',
        area: area || '',
        city: city || 'Bengaluru',
        state: state || 'Karnataka',
        pincode,
        instructions: instructions || null,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
