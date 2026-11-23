import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { products: true, inventories: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ suppliers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, company, email, phone, address, leadTimeDays } = body;

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Name, company and email required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        company,
        email,
        phone: phone || '',
        address: address || '',
        leadTimeDays: leadTimeDays ? Number(leadTimeDays) : 2,
      },
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create supplier' }, { status: 500 });
  }
}
