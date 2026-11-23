import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const categorySlug = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');
    const departmentSlug = searchParams.get('department');
    const brandSlug = searchParams.get('brand');
    const subcategorySlug = searchParams.get('subcategory');
    const featured = searchParams.get('featured') === 'true';
    const bestSeller = searchParams.get('bestSeller') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { brand: { name: { contains: search } } },
        { department: { name: { contains: search } } },
      ];
    }

    if (departmentSlug) {
      where.department = { slug: departmentSlug };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (subcategorySlug) {
      where.subcategory = { slug: subcategorySlug };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured) where.isFeatured = true;
    if (bestSeller) where.isBestSeller = true;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low-high') orderBy = { price: 'asc' };
    if (sort === 'price-high-low') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };
    if (sort === 'popularity') orderBy = { reviewCount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          department: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, origin: true },
          },
          variants: {
            orderBy: { price: 'asc' },
          },
          supplierOffers: {
            where: { isCheapest: true },
            include: {
              supplier: { select: { id: true, name: true, company: true } },
            },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Staff privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      categoryId,
      sku,
      price,
      originalPrice,
      unit,
      weight,
      stock,
      minStock,
      isFeatured,
      isBestSeller,
      description,
      image,
      supplierId,
    } = body;

    if (!name || !categoryId || !sku || price === undefined) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        categoryId,
        sku,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        unit: unit || '1 unit',
        weight: weight ? Number(weight) : 1.0,
        stock: Number(stock || 0),
        minStock: Number(minStock || 5),
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        inventory: {
          create: {
            currentStock: Number(stock || 0),
            minThreshold: Number(minStock || 5),
            status: Number(stock || 0) <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
            supplierId: supplierId || null,
          },
        },
      },
      include: {
        category: true,
        inventory: true,
      },
    });

    // Record stock movement
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'IN',
        quantity: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'New product creation by staff',
        createdBy: session.name,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Product POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
