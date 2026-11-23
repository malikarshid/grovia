'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  ShoppingBag,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function AdminReportsPage() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports/sales');
        const data = await res.json();
        setSalesReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownloadCSV = () => {
    let csv = 'Date,Total Revenue,Orders\n';
    (salesReport?.salesTrend || []).forEach((row: any) => {
      csv += `${row.date},${row.revenue},${row.orders}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grovia_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Revenue performance, order trends, and sales audit metrics
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition w-fit"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sales CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-5 rounded-2xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
          <span className="text-xs font-bold text-gray-500">Gross Sales Revenue</span>
          <h3 className="text-2xl font-black text-[#2E7D32] mt-1">
            {formatCurrency(salesReport?.summary?.totalRevenue || 0)}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Across all confirmed customer orders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-5 rounded-2xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
          <span className="text-xs font-bold text-gray-500">Total Fulfillments</span>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {salesReport?.summary?.completedOrders || 0} Delivered
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">
            {salesReport?.summary?.pendingOrders || 0} active in dispatch
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-5 rounded-2xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
          <span className="text-xs font-bold text-gray-500">Average Order Value (AOV)</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {formatCurrency(salesReport?.summary?.averageOrderValue || 0)}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Optimal basket size in Bengaluru</p>
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">
          Daily Revenue Trend (INR)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesReport?.salesTrend || []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2E7D32"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2E7D32' }}
                name="Daily Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
