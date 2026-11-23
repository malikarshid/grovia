'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Truck,
  Boxes,
  ArrowUpRight,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderDto } from '@/types';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [orderSources, setOrderSources] = useState<any[]>([]);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [salesRes, ordersRes, invRes, delivRes, allOrdersRes] = await Promise.all([
          fetch('/api/reports/sales'),
          fetch('/api/reports/orders'),
          fetch('/api/reports/inventory'),
          fetch('/api/deliveries'),
          fetch('/api/orders?limit=6'),
        ]);

        const salesData = await salesRes.json();
        const ordersData = await ordersRes.json();
        const invData = await invRes.json();
        const delivData = await delivRes.json();
        const allOrdersData = await allOrdersRes.json();

        setSalesSummary(salesData.summary);
        setOrderSources(ordersData.orderSources || []);
        setStockSummary(invData.summary);
        setStockLevels(invData.stockLevels || []);
        setDeliveries(delivData.deliveries || []);
        setRecentOrders(allOrdersData.orders || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const kpis = [
    {
      title: 'Total Orders',
      value: salesSummary?.totalOrders || 0,
      subValue: formatCurrency(salesSummary?.totalRevenue || 0),
      change: '+14.8%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50 dark:bg-slate-800',
    },
    {
      title: 'Orders Completed',
      value: salesSummary?.completedOrders || 0,
      subValue: `${Math.round(((salesSummary?.completedOrders || 0) / Math.max(1, salesSummary?.totalOrders || 1)) * 100)}% fulfillment`,
      change: '+12.4%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'text-[#2E7D32] bg-green-50 dark:bg-slate-800',
    },
    {
      title: 'Orders Pending',
      value: salesSummary?.pendingOrders || 0,
      subValue: 'Requires dispatch',
      change: '-2.1%',
      isPositive: true,
      icon: Clock,
      color: 'text-[#FF6F00] bg-orange-50 dark:bg-slate-800',
    },
    {
      title: 'Orders Cancelled',
      value: salesSummary?.cancelledOrders || 0,
      subValue: '0.8% return rate',
      change: '-0.4%',
      isPositive: true,
      icon: XCircle,
      color: 'text-red-600 bg-red-50 dark:bg-slate-800',
    },
  ];

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // reload deliveries
      const res = await fetch('/api/deliveries');
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row as required by section 19 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>

              <div className="my-3">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {loading ? '—' : kpi.value}
                </span>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{kpi.subValue}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{kpi.change}</span>
                <span className="text-gray-400 font-normal text-[11px] ml-1">vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Visualizations: Order Sources Doughnut + Stock Level Status Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Sources (Section 20) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white">
                  Order Sources Overview
                </h3>
                <p className="text-xs text-gray-500">Channel distribution from real orders</p>
              </div>
              <span className="text-xs font-bold text-gray-400">Total: {salesSummary?.totalOrders || 0}</span>
            </div>

            {/* Doughnut Chart */}
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {orderSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown legend */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            {orderSources.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{s.count} orders</span>
                  <span className="text-gray-400 text-[11px]">({s.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Level Status (Section 21) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white">
                  Stock Level Status
                </h3>
                <p className="text-xs text-gray-500">Live inventory monitoring and reorder alerts</p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
              >
                <span>Manage Stock</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick stock counters */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-green-50 dark:bg-slate-800 text-center">
                <span className="text-base font-black text-[#2E7D32]">
                  {stockSummary?.inStock || 0}
                </span>
                <p className="text-[10px] text-gray-500 font-bold uppercase">In Stock</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-slate-800 text-center">
                <span className="text-base font-black text-amber-600">
                  {stockSummary?.lowStock || 0}
                </span>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Low Stock</p>
              </div>
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-slate-800 text-center">
                <span className="text-base font-black text-red-600">
                  {stockSummary?.outOfStock || 0}
                </span>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Out of Stock</p>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockLevels.slice(0, 7)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="stock" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Current Units" />
                  <Bar dataKey="minStock" fill="#FF6F00" radius={[4, 4, 0, 0]} name="Reorder Alert" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Live Delivery Tracking Monitoring (Section 22) */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#2E7D32]" />
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white">
                Live Delivery Tracking Panel
              </h3>
              <p className="text-xs text-gray-500">
                Status-based monitoring across Bengaluru hub routes
              </p>
            </div>
          </div>
          <Link
            href="/admin/deliveries"
            className="text-xs font-bold text-[#2E7D32] hover:underline"
          >
            View All Deliveries →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Tracking ID</th>
                <th className="pb-3 font-bold">Order #</th>
                <th className="pb-3 font-bold">Customer & Area</th>
                <th className="pb-3 font-bold">Partner Assigned</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {deliveries.slice(0, 5).map((deliv) => (
                <tr key={deliv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 font-mono font-bold text-[#2E7D32]">
                    {deliv.trackingNumber}
                  </td>
                  <td className="py-3 font-mono font-semibold text-gray-900 dark:text-white">
                    #{deliv.order?.orderNumber}
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-gray-900 dark:text-white block">
                      {deliv.order?.user?.name || deliv.order?.address?.fullName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {deliv.order?.address?.area || 'Indiranagar'}, {deliv.order?.address?.pincode}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-medium text-gray-800 dark:text-gray-200 block">
                      {deliv.deliveryPersonName || 'Unassigned'}
                    </span>
                    {deliv.deliveryPersonPhone && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {deliv.deliveryPersonPhone}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        deliv.status === 'DELIVERED'
                          ? 'bg-green-100 text-[#2E7D32]'
                          : deliv.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-orange-100 text-[#FF6F00]'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {deliv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <select
                      value={deliv.status}
                      onChange={(e) => handleUpdateDeliveryStatus(deliv.id, e.target.value)}
                      className="bg-gray-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
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
