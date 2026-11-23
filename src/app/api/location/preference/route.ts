import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pincode, city, state, addressText, latitude, longitude } = body;

    if (!pincode) {
      return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    }

    const session = getSessionFromRequest(req);
    const userId = session?.id || session?.userId;

    if (userId) {
      const existing = await prisma.customerLocationPreference.findFirst({
        where: { userId },
      });

      if (existing) {
        await prisma.customerLocationPreference.update({
          where: { id: existing.id },
          data: {
            pincode,
            city: city || 'Bengaluru',
            state: state || 'Karnataka',
            formattedAddress: addressText || null,
            latitude: latitude || null,
            longitude: longitude || null,
          },
        });
      } else {
        await prisma.customerLocationPreference.create({
          data: {
            userId,
            pincode,
            city: city || 'Bengaluru',
            state: state || 'Karnataka',
            formattedAddress: addressText || null,
            latitude: latitude || null,
            longitude: longitude || null,
          },
        });
      }
    }

    const res = NextResponse.json({
      success: true,
      preference: { pincode, city, state, formattedAddress: addressText, latitude, longitude },
    });

    res.cookies.set('grovia_pincode', pincode, { maxAge: 60 * 60 * 24 * 30, path: '/' });
    if (city) res.cookies.set('grovia_city', city, { maxAge: 60 * 60 * 24 * 30, path: '/' });

    return res;
  } catch (error: any) {
    console.error('Location preference error:', error);
    return NextResponse.json({ error: 'Failed to save location preference' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.id || session?.userId;
    if (userId) {
      const pref = await prisma.customerLocationPreference.findFirst({
        where: { userId },
      });
      if (pref) return NextResponse.json({ preference: pref });
    }

    const pincode = req.cookies.get('grovia_pincode')?.value || '560038';
    const city = req.cookies.get('grovia_city')?.value || 'Bengaluru';

    return NextResponse.json({
      preference: {
        pincode,
        city,
        state: 'Karnataka',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve preference' }, { status: 500 });
  }
}
