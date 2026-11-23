'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { InventoryItemDto, StockMovementDto } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItemDto[]>([]);
  const [movements, setMovements] = useState<StockMovementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stock Adjustment Modal state
  const [adjustItem, setAdjustItem] = useState<InventoryItemDto | null>(null);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REDUCE' | 'SET'>('ADD');
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Stock replenishment from supplier');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const [invRes, movRes] = await Promise.all([
        fetch(`/api/inventory?${params.toString()}`),
        fetch('/api/inventory/movements'),
      ]);

      const invData = await invRes.json();
      const movData = await movRes.json();

      setInventory(invData.inventory || []);
      setMovements(movData.movements || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    setAdjustLoading(true);
    try {
      const res = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustItem.productId,
          adjustmentType: adjustType,
          quantity: adjustQty,
          reason: adjustReason,
        }),
      });

      if (res.ok) {
        setAdjustItem(null);
        loadData();
      }
    } catch (err) {
      console.error('Adjustment failed:', err);
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time stock level monitoring, supplier lead times, and audit logs
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'inventory'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800'
            }`}
          >
            Live Inventory
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Stock History Logs ({movements.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-1.5">
              {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-white dark:bg-slate-900 text-gray-600 border border-gray-200 dark:border-slate-800'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                    <th className="py-3 px-4 font-bold">Product</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Current Stock</th>
                    <th className="py-3 px-4 font-bold">Min Threshold</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Supplier</th>
                    <th className="py-3 px-4 font-bold">Lead Time</th>
                    <th className="py-3 px-4 font-bold text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {item.product.name}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">{item.product.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {item.product.category?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-black text-sm text-gray-900 dark:text-white">
                        {item.currentStock} {item.product.unit}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-semibold">
                        {item.minThreshold} units
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'IN_STOCK'
                              ? 'bg-green-100 text-[#2E7D32]'
                              : item.status === 'LOW_STOCK'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {item.supplier?.name || 'Direct Procurement'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {item.leadTimeDays || 2} days
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setAdjustItem(item)}
                          className="px-3 py-1 bg-green-50 dark:bg-slate-800 text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white rounded-lg font-bold text-xs transition border border-green-200 dark:border-slate-700"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Movements Audit History */
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Movement Type</th>
                  <th className="py-3 px-4 font-bold">Qty</th>
                  <th className="py-3 px-4 font-bold">Previous → New</th>
                  <th className="py-3 px-4 font-bold">Reason</th>
                  <th className="py-3 px-4 font-bold">Authorized User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {m.productName || 'Grocery Product'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.type === 'IN' || m.type === 'RESTOCK'
                            ? 'bg-green-100 text-[#2E7D32]'
                            : m.type === 'OUT'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black">
                      {m.type === 'OUT' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">
                      {m.previousStock} → <span className="font-bold text-gray-900 dark:text-white">{m.newStock}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{m.reason}</td>
                    <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                      {m.createdBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Dialog */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAdjustSubmit}
            className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <div>
              <h3 className="font-black text-base text-gray-900 dark:text-white">
                Adjust Stock: {adjustItem.product.name}
              </h3>
              <p className="text-xs text-gray-500">
                Current Level: <span className="font-bold">{adjustItem.currentStock} units</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Action Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ADD', label: 'Add Stock (+)' },
                  { id: 'REDUCE', label: 'Reduce (-)' },
                  { id: 'SET', label: 'Set Exact' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAdjustType(t.id as any)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      adjustType === t.id
                        ? 'border-[#2E7D32] bg-green-50 text-[#2E7D32]'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Quantity Units *
              </label>
              <input
                type="number"
                min="1"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Reason / Note *
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Received new shipment from Nashik farm"
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustLoading}
                className="flex-1 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20] transition disabled:opacity-40"
              >
                {adjustLoading ? 'Updating...' : 'Save Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
