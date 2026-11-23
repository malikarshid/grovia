'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Package,
  Bike,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminRiderAssignmentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedRider, setSelectedRider] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, ridersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/admin/riders'),
      ]);
      const ordersData = await ordersRes.json();
      const ridersData = await ridersRes.json();

      setOrders(ordersData.orders || []);
      setRiders(ridersData.riders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatch = async (orderId: string) => {
    const riderId = selectedRider[orderId] || riders[0]?.id;
    if (!riderId) {
      alert('Please select a rider first');
      return;
    }

    try {
      setAssigning(orderId);
      setMsg(null);
      const res = await fetch('/api/admin/riders/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, riderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign order');

      setMsg(`Order successfully dispatched to rider!`);
      await loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAssigning(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-7 h-7 text-[#2E7D32]" />
            <span>Live Dispatch & Rider Assignment Matrix</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manual and automated order dispatch console for Delhi NCR and nationwide clusters.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-[#2E7D32] border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Grid: Pending Orders & Available Riders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders Queue (2 columns wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#FF6F00]" />
              <span>Orders Awaiting Dispatch ({pendingOrders.length})</span>
            </h2>
            <span className="text-xs text-gray-400">Connaught Place Hub</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2E7D32] mb-1" />
              <span className="text-xs">Loading queue...</span>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">All confirmed orders have been assigned!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                      {order.deliveryType === 'QUICK' ? '10-MIN QUICK' : 'EXPRESS'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {order.customerName} • ₹{order.totalAmount}
                    </p>
                    <p className="text-gray-400 line-clamp-1">{order.shippingAddress}</p>
                  </div>

                  {/* Dispatch Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <select
                      value={selectedRider[order.id] || riders[0]?.id || ''}
                      onChange={(e) =>
                        setSelectedRider((prev) => ({ ...prev, [order.id]: e.target.value }))
                      }
                      className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200"
                    >
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.user?.name} ({r.vehicleNumber}) - {r.currentStatus}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDispatch(order.id)}
                      disabled={assigning === order.id}
                      className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1"
                    >
                      <span>Dispatch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Riders Column */}
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-[#2E7D32]" />
            <span>Active Delivery Fleet ({riders.length})</span>
          </h2>

          <div className="space-y-2.5">
            {riders.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">{r.user?.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {r.currentStatus}
                  </span>
                </div>
                <p className="text-gray-400 font-mono text-[11px]">{r.vehicleNumber} • {r.vehicleType}</p>
                <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                  <span>Rating: <strong className="text-amber-500">{r.rating}★</strong></span>
                  <span>Completed: <strong className="text-gray-700 dark:text-gray-300">{r.totalTrips || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
