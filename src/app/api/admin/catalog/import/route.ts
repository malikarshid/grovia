import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, hasAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const imports = await prisma.productImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ imports });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch imports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Staff permissions required.' }, { status: 403 });
    }

    const body = await req.json();
    const { items, fileName, format = 'JSON' } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Payload must contain a non-empty items array' }, { status: 400 });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Fallback category if not specified
    const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
      data: {
        name: 'General Grocery',
        slug: 'general-grocery',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      },
    });

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      try {
        if (!row.name || !row.sku || row.price === undefined) {
          throw new Error(`Row ${i + 1}: Missing name, sku, or price`);
        }

        const slug = row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

        // Find or link category / department
        let catId = defaultCat.id;
        if (row.categorySlug) {
          const foundCat = await prisma.category.findUnique({ where: { slug: row.categorySlug } });
          if (foundCat) catId = foundCat.id;
        }

        let deptId = null;
        if (row.departmentSlug) {
          const foundDept = await prisma.department.findUnique({ where: { slug: row.departmentSlug } });
          if (foundDept) deptId = foundDept.id;
        }

        let brandId = null;
        if (row.brandSlug) {
          const foundBrand = await prisma.brand.findUnique({ where: { slug: row.brandSlug } });
          if (foundBrand) brandId = foundBrand.id;
        }

        const price = parseFloat(row.price);
        const mrp = row.mrp ? parseFloat(row.mrp) : price * 1.15;
        const stock = parseInt(row.stock || '50', 10);
        const unit = row.unit || '1 unit';
        const weight = parseFloat(row.weight || '1.0');

        const product = await prisma.product.upsert({
          where: { sku: row.sku },
          update: {
            name: row.name,
            description: row.description || row.name,
            price,
            mrp,
            originalPrice: mrp,
            stock,
            unit,
            weight,
            categoryId: catId,
            departmentId: deptId,
            brandId: brandId,
            image: row.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
          },
          create: {
            name: row.name,
            slug,
            description: row.description || row.name,
            sku: row.sku,
            price,
            mrp,
            originalPrice: mrp,
            stock,
            unit,
            weight,
            categoryId: catId,
            departmentId: deptId,
            brandId: brandId,
            image: row.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
            inventory: {
              create: {
                currentStock: stock,
                minThreshold: 10,
                status: stock > 10 ? 'IN_STOCK' : 'LOW_STOCK',
              },
            },
          },
        });

        // If variants provided in row
        if (Array.isArray(row.variants) && row.variants.length > 0) {
          for (const v of row.variants) {
            await prisma.productVariant.upsert({
              where: { sku: v.sku },
              update: {
                title: v.title,
                price: parseFloat(v.price),
                mrp: parseFloat(v.mrp || v.price),
                stock: parseInt(v.stock || '50', 10),
                unit: v.unit || unit,
                weight: parseFloat(v.weight || '1.0'),
              },
              create: {
                productId: product.id,
                title: v.title,
                sku: v.sku,
                price: parseFloat(v.price),
                mrp: parseFloat(v.mrp || v.price),
                stock: parseInt(v.stock || '50', 10),
                unit: v.unit || unit,
                weight: parseFloat(v.weight || '1.0'),
                isDefault: Boolean(v.isDefault),
              },
            });
          }
        }

        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Row ${i + 1} (${row.name || row.sku}): ${err.message}`);
      }
    }

    const logRecord = await prisma.productImport.create({
      data: {
        fileName: fileName || `catalog-batch-${Date.now()}.${format.toLowerCase()}`,
        format,
        totalRows: items.length,
        successRows: successCount,
        failedRows: failedCount,
        status: failedCount === 0 ? 'COMPLETED' : successCount > 0 ? 'PARTIAL' : 'FAILED',
        errorLog: errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
        importedBy: session.name || session.email || 'Admin',
      },
    });

    return NextResponse.json({
      success: true,
      importId: logRecord.id,
      totalRows: items.length,
      successRows: successCount,
      failedRows: failedCount,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Catalog import error:', error);
    return NextResponse.json({ error: error.message || 'Import processing failed' }, { status: 500 });
  }
}
