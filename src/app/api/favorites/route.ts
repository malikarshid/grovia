import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      favorites: favorites.map((f) => f.product),
      favoriteIds: favorites.map((f) => f.productId),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'ProductId required' }, { status: 400 });
    }

    await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: session.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.id,
        productId,
      },
    });

    return NextResponse.json({ message: 'Added to favorites' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save favorite' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'ProductId required' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: session.id,
        productId,
      },
    });

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
