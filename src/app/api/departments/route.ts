import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeCategories = searchParams.get('includeCategories') !== 'false';

    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: includeCategories
        ? {
            categories: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
              include: {
                subcategories: {
                  where: { isActive: true },
                  orderBy: { displayOrder: 'asc' },
                },
                _count: {
                  select: { products: true },
                },
              },
            },
            _count: {
              select: { products: true },
            },
          }
        : undefined,
    });

    return NextResponse.json({ departments });
  } catch (error: any) {
    console.error('Departments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
