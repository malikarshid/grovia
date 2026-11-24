import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const entity = searchParams.get('entity') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: any = {};
    if (entity !== 'ALL') {
      where.entity = entity;
    }
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { details: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Audit logs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 403 });
    }

    const body = await req.json();
    const { action, entity, entityId, details } = body;

    if (!action || !entity) {
      return NextResponse.json({ error: 'Action and Entity are required' }, { status: 400 });
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: session.id,
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: any) {
    console.error('Create audit log error:', error);
    return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
  }
}
