import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const loginId = (body.loginId || body.phone || body.username || body.email || '').trim();
    const password = (body.password || '').trim();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'Rider ID/Phone and password are required.' },
        { status: 400 }
      );
    }

    // Lookup user by username, phone, or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: loginId },
          { phone: loginId },
          { email: loginId.toLowerCase() },
        ],
      },
      include: {
        riderProfile: true,
      },
    });

    if (!user || (user.role !== 'RIDER' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Invalid delivery rider credentials.' },
        { status: 401 }
      );
    }

    if (user.isSuspended || !user.isActive) {
      return NextResponse.json(
        { error: 'Your rider account is suspended or inactive. Please contact Grovia Fleet Operations.' },
        { status: 403 }
      );
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account locked due to repeated failed attempts. Please retry in ${waitMinutes} minutes.` },
        { status: 423 }
      );
    }

    // Production credential check for default initial password
    const isProduction = process.env.NODE_ENV === 'production';
    const allowDefault = process.env.ALLOW_DEFAULT_INITIAL_PASSWORD === 'true';
    if (isProduction && !allowDefault && password === 'Rider@9682pw') {
      return NextResponse.json(
        { error: 'Default initial password is disabled in production. Please use your personal secure password.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = newAttempts >= 5;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockoutUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      return NextResponse.json(
        {
          error: shouldLock
            ? 'Account locked for 15 minutes due to 5 consecutive failed attempts.'
            : `Invalid credentials. Attempt ${newAttempts} of 5.`,
        },
        { status: 401 }
      );
    }

    // Reset failed attempts & record login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as any,
      avatar: user.avatar,
    };

    const token = generateToken(sessionPayload);

    const response = NextResponse.json({
      message: 'Rider login successful',
      user: {
        ...sessionPayload,
        username: user.username,
        mustChangePassword: user.mustChangePassword,
        riderProfile: user.riderProfile,
      },
    });

    response.cookies.set('grovia_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Rider Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
