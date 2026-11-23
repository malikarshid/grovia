import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as adminLoginHandler } from '@/app/api/auth/admin-login/route';
import { POST as riderLoginHandler } from '@/app/api/auth/rider-login/route';
import { GET as salesReportHandler } from '@/app/api/reports/sales/route';
import { GET as ordersReportHandler } from '@/app/api/reports/orders/route';
import { GET as inventoryReportHandler } from '@/app/api/reports/inventory/route';
import { GET as deliveriesHandler } from '@/app/api/deliveries/route';
import { GET as riderDashboardHandler } from '@/app/api/rider/dashboard/route';
import { GET as auditLogsHandler } from '@/app/api/admin/audit-logs/route';

describe('Live API Endpoints & Role-Based Access Testing', () => {
  let adminSessionCookie = '';
  let riderSessionCookie = '';

  it('authenticates admin_me with 9682pw and issues an HTTP-only grovia_session cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'admin_me', password: '9682pw' }),
    });

    const res = await adminLoginHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.role).toBe('SUPER_ADMIN');
    expect(data.user.username).toBe('admin_me');

    // Extract cookie
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('grovia_session=');
    const match = setCookie?.match(/grovia_session=([^;]+)/);
    expect(match).not.toBeNull();
    adminSessionCookie = match![1];
  });

  it('authenticates rider_me with Rider@9682pw and issues a rider session cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/rider-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'rider_me', password: 'Rider@9682pw' }),
    });

    const res = await riderLoginHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.role).toBe('RIDER');

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('grovia_session=');
    const match = setCookie?.match(/grovia_session=([^;]+)/);
    expect(match).not.toBeNull();
    riderSessionCookie = match![1];
  });

  it('rejects unauthenticated requests to protected admin reports with 403', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/reports/sales');
    const res = await salesReportHandler(unauthReq);
    expect(res.status).toBe(403);
  });

  it('rejects unauthenticated requests to rider dashboard with 401', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/rider/dashboard');
    const res = await riderDashboardHandler(unauthReq);
    expect(res.status).toBe(401);
  });

  it('rejects rider sessions attempting to access admin sales reports with 403', async () => {
    const riderReq = new NextRequest('http://localhost:3000/api/reports/sales', {
      headers: {
        cookie: `grovia_session=${riderSessionCookie}`,
      },
    });

    const res = await salesReportHandler(riderReq);
    expect(res.status).toBe(403);
  });

  it('allows authenticated admin to fetch live sales report from real database', async () => {
    const req = new NextRequest('http://localhost:3000/api/reports/sales', {
      headers: {
        cookie: `grovia_session=${adminSessionCookie}`,
      },
    });

    const res = await salesReportHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.summary).toBeDefined();
    expect(typeof data.summary.totalRevenue).toBe('number');
    expect(typeof data.summary.totalOrders).toBe('number');
  });

  it('allows authenticated admin to fetch order sources and channel breakdown', async () => {
    const req = new NextRequest('http://localhost:3000/api/reports/orders', {
      headers: {
        cookie: `grovia_session=${adminSessionCookie}`,
      },
    });

    const res = await ordersReportHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.orderSources).toBeInstanceOf(Array);
    expect(data.orderSources.length).toBeGreaterThan(0);
  });

  it('allows authenticated admin to fetch inventory levels and stock summaries', async () => {
    const req = new NextRequest('http://localhost:3000/api/reports/inventory', {
      headers: {
        cookie: `grovia_session=${adminSessionCookie}`,
      },
    });

    const res = await inventoryReportHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.summary).toBeDefined();
    expect(data.summary.totalProducts).toBeGreaterThan(0);
  });

  it('allows authenticated admin to fetch deliveries and driver assignments', async () => {
    const req = new NextRequest('http://localhost:3000/api/deliveries', {
      headers: {
        cookie: `grovia_session=${adminSessionCookie}`,
      },
    });

    const res = await deliveriesHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.deliveries).toBeInstanceOf(Array);
  });

  it('allows authenticated rider to fetch rider dashboard with active assignments', async () => {
    const req = new NextRequest('http://localhost:3000/api/rider/dashboard', {
      headers: {
        cookie: `grovia_session=${riderSessionCookie}`,
      },
    });

    const res = await riderDashboardHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.profile).toBeDefined();
    expect(data.profile.userId).toBeDefined();
    expect(data.stats).toBeDefined();
  });

  it('allows authenticated admin to query audit logs', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/audit-logs', {
      headers: {
        cookie: `grovia_session=${adminSessionCookie}`,
      },
    });

    const res = await auditLogsHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.logs).toBeInstanceOf(Array);
  });
});
