'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        const res = await fetch(`/api/customers?${params.toString()}`);
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Customer Relations & CRM
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Registered grocery shoppers, loyalty points, and purchase history
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4 font-bold">Customer Name</th>
                <th className="py-3 px-4 font-bold">Email</th>
                <th className="py-3 px-4 font-bold">Phone Number</th>
                <th className="py-3 px-4 font-bold">Total Orders</th>
                <th className="py-3 px-4 font-bold">Total Spent</th>
                <th className="py-3 px-4 font-bold">Loyalty Points</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                    {c.email}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{c.phone}</td>
                  <td className="py-3 px-4 font-bold">{c.totalOrders} orders</td>
                  <td className="py-3 px-4 font-black text-[#2E7D32]">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-600">
                    ★ {c.loyaltyPoints} pts
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-[#2E7D32] px-2 py-0.5 rounded-full text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
