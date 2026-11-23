import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { ChevronRight } from 'lucide-react';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
          Grocery Categories
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Explore our complete range of farm fresh vegetables, fruits, dairy, and household essentials
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-2xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] overflow-hidden hover:shadow-grovia transition duration-200"
          >
            <div className="relative pt-[60%] w-full bg-gray-50 dark:bg-slate-800 overflow-hidden">
              <ImageWithFallback
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[#2E7D32] dark:text-[#4CAF50] text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                {cat._count.products} Products
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white eye-protection:text-[#3E3B32] group-hover:text-[#2E7D32] transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {cat.description || 'Fresh daily groceries'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-slate-800 flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
