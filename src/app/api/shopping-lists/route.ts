import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.id || session?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const lists = await prisma.shoppingList.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                mrp: true,
                image: true,
                unit: true,
                stock: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ lists });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch shopping lists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const userId = session?.id || session?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, productIds } = body;

    if (!name) {
      return NextResponse.json({ error: 'List name is required' }, { status: 400 });
    }

    const list = await prisma.shoppingList.create({
      data: {
        userId,
        name,
        items: Array.isArray(productIds) && productIds.length > 0
          ? {
              create: productIds.map((pId: string) => ({
                productId: pId,
                quantity: 1,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json({ success: true, list }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create shopping list' }, { status: 500 });
  }
}
