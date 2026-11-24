import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        username: true,
        role: true,
        avatar: true,
        mustChangePassword: true,
        isSuspended: true,
        customerProfile: true,
        riderProfile: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Me API error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
