import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Verify database connectivity
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const dbLatencyMs = Date.now() - startTime;

    // 2. Determine environment and database provider
    const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
    const dbProvider = isPostgres ? 'PostgreSQL' : 'SQLite (Local Engine)';

    return NextResponse.json(
      {
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'CONNECTED',
          provider: dbProvider,
          latencyMs: dbLatencyMs,
          counts: {
            users: userCount,
            products: productCount,
          },
        },
        services: {
          authentication: 'OPERATIONAL',
          riderTelemetry: 'OPERATIONAL',
          inventoryEngine: 'OPERATIONAL',
          paymentGateway: process.env.PAYMENT_MODE === 'LIVE' ? 'LIVE_CONFIGURED' : 'DEMO_STANDBY',
          courierLogistics: process.env.SHIPROCKET_API_EMAIL ? 'LIVE_CONFIGURED' : 'STANDBY_MOCK',
        },
        version: '1.0.0',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        error: error.message || 'Database connectivity failure',
        database: {
          status: 'DISCONNECTED',
        },
      },
      { status: 503 }
    );
  }
}
