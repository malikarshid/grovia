import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'grovia_super_secure_jwt_secret_key_change_in_production_2026';
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'INVENTORY_MGR', 'ORDER_MGR', 'DELIVERY_MGR'];

// Helper to decode and verify JWT in Edge Runtime using Web Crypto API
async function verifyJwtInEdge(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    // Decode payload
    const base64Payload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(base64Payload.length + ((4 - (base64Payload.length % 4)) % 4), '=');
    const payloadJson = atob(paddedPayload);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // Convert secret to WebCrypto Key
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Signature from base64url to Uint8Array
    const base64Sig = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const paddedSig = base64Sig.padEnd(base64Sig.length + ((4 - (base64Sig.length % 4)) % 4), '=');
    const sigStr = atob(paddedSig);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data);

    if (!isValid) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('grovia_session')?.value;

  // 1. ADMIN ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (pathname === '/admin/login') {
      if (token) {
        const payload = await verifyJwtInEdge(token);
        if (payload && ADMIN_ROLES.includes(payload.role)) {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }
      return NextResponse.next();
    }

    // Check token for all protected /admin routes
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJwtInEdge(token);
    if (!payload || !ADMIN_ROLES.includes(payload.role)) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. RIDER ROUTE PROTECTION
  if (pathname.startsWith('/rider')) {
    // Allow access to rider login page
    if (pathname === '/rider/login') {
      if (token) {
        const payload = await verifyJwtInEdge(token);
        if (payload && (payload.role === 'RIDER' || payload.role === 'SUPER_ADMIN')) {
          return NextResponse.redirect(new URL('/rider/dashboard', req.url));
        }
      }
      return NextResponse.next();
    }

    // Check token for all protected /rider routes
    if (!token) {
      const loginUrl = new URL('/rider/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJwtInEdge(token);
    if (!payload || (payload.role !== 'RIDER' && payload.role !== 'SUPER_ADMIN')) {
      const loginUrl = new URL('/rider/login', req.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/rider/:path*'],
};
