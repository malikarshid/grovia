import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const slots = await prisma.deliverySlot.findMany({
      where: { isActive: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return NextResponse.json({ slots });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch delivery slots' }, { status: 500 });
  }
}
