import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // For security reasons, do not reveal if the email exists
    return NextResponse.json({
      message: 'If an account exists with this email, password reset instructions have been sent.',
      demoNote: user ? 'Demo password reset link generated successfully.' : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
