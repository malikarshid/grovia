'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Layers,
  Tag,
  Store,
  Zap,
  TrendingDown,
  Building2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminMarketplacePage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [deptRes, prodRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/products?limit=100'),
        ]);

        const deptData = await deptRes.json();
        const prodData = await prodRes.json();

        setDepartments(deptData.departments || []);
        setProducts(prodData.products || []);
      } catch (err) {
        console.error('Failed to load marketplace data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesDept = selectedDept === 'all' || p.department?.slug === selectedDept;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950/40 text-[#2E7D32]">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Marketplace Catalogue & Multi-Supplier SKUs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage 30 marketplace departments, multi-size product variants, and dynamic supplier pricing offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-950/30 text-[#2E7D32] border border-green-200 dark:border-green-800">
            {departments.length} Departments Active
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 border border-blue-200 dark:border-blue-800">
            {products.length} Base SKUs
          </span>
        </div>
      </div>

      {/* 30 Departments Filter Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Filter by Department ({departments.length})</span>
          </span>
          {selectedDept !== 'all' && (
            <button
              onClick={() => setSelectedDept('all')}
              className="text-xs font-semibold text-[#2E7D32] hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedDept === 'all'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All Departments ({products.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedDept === d.slug
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, Product Name, Brand (e.g. Amul, Aashirvaad)..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-[#2E7D32]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Marketplace Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Product & Brand</th>
                <th className="py-3 px-4">Department & Category</th>
                <th className="py-3 px-4">Variants / Pack Sizes</th>
                <th className="py-3 px-4">Catalog MRP & Selling Price</th>
                <th className="py-3 px-4">Best Supplier Offer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading marketplace catalogue...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No products matched your department and search filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-gray-400">{prod.sku}</span>
                            {prod.brand && (
                              <span className="text-[10px] font-bold text-[#2E7D32] bg-green-50 dark:bg-green-950/40 px-1.5 py-0.2 rounded">
                                {prod.brand.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {prod.department?.name || 'Staples & Everyday'}
                        </span>
                        <p className="text-[10px] text-gray-400">{prod.category?.name}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {prod.variants && prod.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {prod.variants.map((v: any) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700"
                            >
                              {v.title} ({formatCurrency(v.price)})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">{prod.unit}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-sm text-[#2E7D32] dark:text-green-400">
                          {formatCurrency(prod.price)}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatCurrency(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {prod.supplierOffers && prod.supplierOffers.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          <div>
                            <span className="font-extrabold text-[#2E7D32]">
                              {formatCurrency(prod.supplierOffers[0].sellingPrice)}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              via {prod.supplierOffers[0].supplier?.name || 'Verified B2B'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Direct Sourced</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/product/${prod.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-[#2E7D32] transition"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
